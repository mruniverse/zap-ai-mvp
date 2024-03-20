import { PrismaService } from './../prisma/prisma.service';
import { ReceivedCallback, Status } from './entities/z-api.entity';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { HttpService } from 'src/http/http.service';

@Injectable()
export class ZApiService {
  private InstanceID: string;
  private Token: string;
  private BaseURL: string;

  constructor(
    private config: ConfigService,
    private http: HttpService,
    private prisma: PrismaService,
  ) {
    this.InstanceID = this.config.get('ZAPI_INSTANCE_ID');
    this.Token = this.config.get('ZAPI_TOKEN');
    this.BaseURL = `https://api.z-api.io/instances/${this.InstanceID}/token/${this.Token}/`;
  }

  async sendAudio(phone: string, audio: Buffer) {
    const sendAudioUrl = `${this.BaseURL}send-audio`;
    const audioBase64 = `data:audio/mpeg;base64,${audio.toString('base64')}`;

    try {
      const { data } = await this.http.post(sendAudioUrl, { phone, audio: audioBase64 });
      return data;
    } catch (error) {
      console.error('Error sending audio:', error.response.data);
      throw new Error('Error sending audio');
    }
  }

  // Check and update the status of the message, if it exists. If it doesn't, create a new message.
  // The method return the status of the received message.
  async createOrUpdateMessage(message: ReceivedCallback, text?: string): Promise<Status | false> {
    const textMessage = text || message.text?.message;
    const messageExists = await this.prisma.message.findFirst({
      where: { zapiMessageId: message.messageId },
    });
    if (messageExists) {
      if (messageExists.messageStatus === message.status) return false;
      const newMessage = await this.prisma.message.update({
        where: { id: messageExists.id },
        data: { messageStatus: message.status },
      });

      return newMessage.messageStatus as Status;
    } else {
      const newMessage = await this.prisma.message.create({
        data: {
          zapiMessageId: message.messageId,
          messageStatus: message.status,
          messageType: message.type,
          text: textMessage,
          senderPhoneNumber: message.phone,
          receipientPhoneNumber: message.connectedPhone,
        },
      });

      return newMessage.messageStatus as Status;
    }
  }

  private getMessageType(message: ReceivedCallback) {
    if (message.text) return 'text';
    if (message.audio) return 'audio';
    if (message.video) return 'video';
    if (message.document) return 'document';
  }
}
