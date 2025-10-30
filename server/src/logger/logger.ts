import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
  log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`);
  }
  error(message: string, trace?: string) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (trace) {
      console.error(trace);
    }
  }
  warn(message: string) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }
  debug(message: string) {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
  }
  verbose(message: string) {
    console.info(`[VERBOSE] ${new Date().toISOString()} - ${message}`);
  }
}
