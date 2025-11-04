import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Connection } from 'mongoose';
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
      process.env.MONGODB_URI || 'mongodb://localhost:27017/redsocial'
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
export class AppModule implements OnModuleInit {
  constructor(@InjectConnection() private connection: Connection) {}

  onModuleInit() {
    const db = this.connection;
    
    console.log('🔌 MongoDB URI configurada:', !!process.env.MONGODB_URI);
    console.log('📊 Estado inicial de conexión:', db.readyState);
    
    db.on('connected', () => {
      console.log('✅ MongoDB conectado exitosamente');
      console.log('📊 ReadyState:', db.readyState);
    });
    
    db.on('error', (err) => {
      console.error('❌ Error de conexión MongoDB:', err.message);
    });
    
    db.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });
  }
}
