import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Uploadable, toFile } from 'openai/uploads';
import { ContextService } from 'src/context/context.service';

@Injectable()
export class ChatAiService {
  private openai: OpenAI;
  private audioPrompt =
    'Seu nome é Mars, você é a inteligência artificial da Igreja Quadrangular SEDE \
    Responda as perguntas de forma coloquial, como se estivesse pensando no que dizer.';

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private context: ContextService,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.get('OPENAI_API_KEY') });
  }

  async audioToText(audio: Buffer): Promise<string> {
    const audioFile: Uploadable = await toFile(audio, 'audio.ogg');
    const response = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
    });

    return response.text;
  }

  async createAudioResponse(question: string, senderPhone: string, connectedPhone: string) {
    const context = await this.context.searchIndex(question);
    const promptWithContext = `${this.audioPrompt}. Use o seguinte contexto: ${context}`;
    const messageHistory = await this.prisma.message.findMany({
      select: { senderPhoneNumber: true, text: true },
      where: {
        OR: [{ senderPhoneNumber: senderPhone }, { receipientPhoneNumber: senderPhone }],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('Context', promptWithContext);

    const answer = await this.askAi(
      question,
      promptWithContext,
      messageHistory.reverse().map((message) => ({
        role: message.senderPhoneNumber === senderPhone ? 'user' : 'assistant',
        content: message.text,
      })),
    );

    if (answer) {
      await this.prisma.message.create({
        data: {
          senderPhoneNumber: connectedPhone,
          text: answer,
          messageStatus: 'SENT',
          messageType: 'AUDIO',
          receipientPhoneNumber: senderPhone,
        },
      });

      return this.textToSpeech(answer);
    } else {
      return this.textToSpeech('Não entendi a pergunta.');
    }
  }

  async textToSpeech(
    text: string,
    voice: OpenAI.Audio.SpeechCreateParams['voice'] = 'nova',
    model: OpenAI.Audio.SpeechCreateParams['model'] = 'tts-1',
  ): Promise<Buffer> {
    const response = await this.openai.audio.speech.create({ model, voice, input: text });

    return Buffer.from(await response.arrayBuffer());
  }

  async askAi(
    question: string,
    prompt: string,
    messages: OpenAI.Chat.ChatCompletionCreateParams['messages'] = [],
    model: OpenAI.Chat.ChatCompletionCreateParams['model'] = 'gpt-3.5-turbo',
  ): Promise<string | false> {
    const messageHistory = [
      { role: 'system', content: prompt },
      ...messages,
      { role: 'user', content: question },
    ] as OpenAI.Chat.ChatCompletionCreateParams['messages'];

    const response = await this.openai.chat.completions.create({
      model: model,
      messages: messageHistory,
    });
    if (!response.choices) return false;

    return response.choices[0].message.content;
  }
}
