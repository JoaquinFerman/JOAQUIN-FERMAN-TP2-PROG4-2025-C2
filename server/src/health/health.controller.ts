import { Controller, Get } from '@nestjs/common';
import mongoose from 'mongoose';

@Controller('health')
export class HealthController {
  @Get()
  get() {
    const state = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
    return {
      status: state === 1 ? 'ok' : 'unhealthy',
      mongooseState: state,
      timestamp: new Date().toISOString(),
    };
  }
}
