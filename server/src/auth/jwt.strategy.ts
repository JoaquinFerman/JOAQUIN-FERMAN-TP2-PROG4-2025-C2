import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '3da588f1998d829738b1207f2501f84b',
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JwtStrategy.validate - Payload:', payload);
    console.log('JwtStrategy.validate - Looking for user ID:', payload.sub);
    try {
      const usuario = await this.usuariosService.findOne(payload.sub);
      if (!usuario) {
        console.log('JwtStrategy.validate - User not found');
        throw new UnauthorizedException();
      }
      console.log('JwtStrategy.validate - User found:', usuario.nombreUsuario);
      return usuario;
    } catch (error) {
      console.error('JwtStrategy.validate - Error:', error.message);
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }
  }
}