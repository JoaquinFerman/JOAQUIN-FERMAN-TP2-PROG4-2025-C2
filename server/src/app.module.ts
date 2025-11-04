import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as mongoose from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppLogger } from './logger/logger';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SupabaseModule } from './supabase/supabase.module';
import { DebugModule } from './debug/debug.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/redsocial',
      {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        family: 4,
        retryWrites: true,
        retryReads: true,
      }
    ),
    PublicacionesModule,
    AuthModule,
    UsuariosModule,
    SupabaseModule,
    DebugModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, AppLogger],
})
export class AppModule {}
