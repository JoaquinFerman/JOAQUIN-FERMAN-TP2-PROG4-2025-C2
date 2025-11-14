import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsuariosModule,
    SupabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || '3da588f1998d829738b1207f2501f84b',
      signOptions: { expiresIn: '1m' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}