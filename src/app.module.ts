import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './http/http.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZApiModule } from './z-api/z-api.module';
import { ChatAiModule } from './chat-ai/chat-ai.module';
import { ContextModule } from './context/context.module';

@Module({
  imports: [ZApiModule, ChatAiModule, HttpModule, ConfigModule.forRoot(), PrismaModule, ContextModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
