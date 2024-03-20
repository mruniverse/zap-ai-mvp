import { PrismaModule } from './../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { ConfigModule } from '@nestjs/config';
import { ContextModule } from 'src/context/context.module';

@Module({
  imports: [ConfigModule, PrismaModule, ContextModule],
  providers: [ChatAiService],
  exports: [ChatAiService],
})
export class ChatAiModule {}
