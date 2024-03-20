import { PrismaModule } from './../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ZApiService } from './z-api.service';
import { ZApiController } from './z-api.controller';
import { ChatAiModule } from 'src/chat-ai/chat-ai.module';
import { ContextModule } from 'src/context/context.module';

@Module({
  imports: [ChatAiModule, ConfigModule, PrismaModule, ContextModule],
  controllers: [ZApiController],
  providers: [ZApiService],
})
export class ZApiModule {}
