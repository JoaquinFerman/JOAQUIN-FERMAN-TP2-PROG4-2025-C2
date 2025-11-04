import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    // Railway healthcheck endpoint - responde inmediatamente sin verificar DB
    return { 
      status: 'ok', 
      message: this.appService.getHello(),
      timestamp: new Date().toISOString()
    };
  }
}
