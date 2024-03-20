import { ConfigModule } from '@nestjs/config';
import { HttpModule as AxiosHttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { HttpService } from './http.service';

@Global()
@Module({
  imports: [AxiosHttpModule, ConfigModule],
  providers: [HttpService],
  exports: [AxiosHttpModule, HttpService],
})
export class HttpModule extends AxiosHttpModule {}
