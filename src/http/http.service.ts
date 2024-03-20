import { ConfigService } from '@nestjs/config';
import { HttpService as AxiosHttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpService {
  private baseUrl: string;
  constructor(
    private http: AxiosHttpService,
    private config: ConfigService,
  ) {
    this.setZapiTokenHeader(this.config.get('ZAPI_CLIENT_TOKEN'));
  }

  public setZapiTokenHeader(token: string) {
    this.http.axiosRef.defaults.headers.common['Client-Token'] = token;
  }

  public async getFile(url: string): Promise<ArrayBuffer> {
    return (await lastValueFrom(this.http.get(url, { responseType: 'arraybuffer', baseURL: this.baseUrl }))).data;
  }

  public get(url: string, config?: AxiosRequestConfig<any>): Promise<any> {
    return lastValueFrom(
      this.http.get(url, {
        ...config,
        baseURL: this.baseUrl,
      }),
    );
  }

  public post(url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<any> {
    return lastValueFrom(
      this.http.post(url, data, {
        ...config,
        baseURL: this.baseUrl,
      }),
    );
  }

  public patch(url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<any> {
    return lastValueFrom(
      this.http.patch(url, data, {
        ...config,
        baseURL: this.baseUrl,
      }),
    );
  }
}
