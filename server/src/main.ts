import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  console.log('� Starting server...');
  console.log('📍 MONGODB_URI present:', !!process.env.MONGODB_URI);
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const { HttpExceptionFilter } = await import('./filters/http-exception.filter.js');
  app.useGlobalFilters(new HttpExceptionFilter());
  // CORS configuration: if the environment variable CLIENT_URLS is set (comma-separated),
  // use it as the allowed origins. Otherwise fall back to permissive CORS (existing behaviour).
  // Example: CLIENT_URLS="https://tp-integrador.vercel.app,http://localhost:4200"
  const clientUrls = process.env.CLIENT_URLS;
  if (clientUrls) {
    const origins = clientUrls.split(',').map((s) => s.trim()).filter(Boolean);
    app.enableCors({ origin: origins });
  } else {
    app.enableCors();
  }
  
  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`✅ Server running on port ${port}`);
}
bootstrap();
