import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const { HttpExceptionFilter } = await import('./filters/http-exception.filter.js');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  
  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
