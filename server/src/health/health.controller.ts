import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  get() {
    const state = this.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
    return {
      status: state === 1 ? 'ok' : 'unhealthy',
      mongooseState: state,
      timestamp: new Date().toISOString(),
    };
  }
}
