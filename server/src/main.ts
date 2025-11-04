import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as mongoose from 'mongoose';

async function bootstrap() {
  // Log MongoDB connection attempts
  console.log('🔌 Attempting to connect to MongoDB...');
  console.log('📍 MONGODB_URI present:', !!process.env.MONGODB_URI);
  console.log('📍 MONGODB_URI start:', process.env.MONGODB_URI?.substring(0, 30));
  
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
  });

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
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
