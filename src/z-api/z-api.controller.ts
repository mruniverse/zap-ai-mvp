import { ChatAiService } from './../chat-ai/chat-ai.service';
import { ContextService } from './../context/context.service';
import { ReceivedCallback } from './entities/z-api.entity';
import { Controller, Post, Body } from '@nestjs/common';
import { ZApiService } from './z-api.service';
import { HttpService } from 'src/http/http.service';

@Controller()
export class ZApiController {
  constructor(
    private readonly zApiService: ZApiService,
    private chatAi: ChatAiService,
    private context: ContextService,
    private http: HttpService,
  ) {}

  @Post('on-message-received')
  async onMessageReceived(@Body() receivedMessage: ReceivedCallback) {
    console.log('Message received:', receivedMessage.phone, receivedMessage.text?.message || receivedMessage.status);

    if (!receivedMessage.isGroup || receivedMessage.status !== 'RECEIVED') return;
    const message = await this.getMessage(receivedMessage);
    const messageStatus = await this.zApiService.createOrUpdateMessage(receivedMessage, message);
    const isValidMessage = receivedMessage.isGroup && messageStatus;
    const isTestingGroup = isValidMessage && receivedMessage.phone === '120363231931008224-group';
    const isKnowledgeBaseGroup = isValidMessage && receivedMessage.phone === '120363251955005679-group';

    if (isTestingGroup) {
      const audioResponse = await this.chatAi.createAudioResponse(
        message,
        receivedMessage.phone,
        receivedMessage.connectedPhone,
      );

      return this.zApiService.sendAudio(receivedMessage.phone, audioResponse);
    } else if (isKnowledgeBaseGroup) {
      console.log('Processing message for knowledge base');
      const response = await this.context.storeIndexFromString(receivedMessage.text.message);
      console.log('Response:', response);
    } else if (!isValidMessage) {
      console.log('Ignoring message, already processed');
    }

    return 'Message processed';
  }

  async getMessage(receivedMessage: ReceivedCallback) {
    if (receivedMessage.audio) {
      const audioArrayBuffer = await this.http.getFile(receivedMessage.audio.audioUrl);
      const audioBuffer = Buffer.from(audioArrayBuffer);
      return await this.chatAi.audioToText(audioBuffer);
    }

    if (receivedMessage.text.message) {
      return receivedMessage.text.message;
    }
  }
}
