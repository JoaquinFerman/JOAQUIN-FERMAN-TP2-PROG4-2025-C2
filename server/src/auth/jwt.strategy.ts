import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtPayload } from './auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Allow access to the request object so we can log the raw Authorization header / token
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '3da588f1998d829738b1207f2501f84b',
    });
  }

  // When passReqToCallback is true, Passport will call validate(req, payload)
  async validate(req: Request, payload: JwtPayload) {
    // Log request authorization header and token (if present)
    const authHeader = (req.headers && (req.headers['authorization'] as string)) || '';
    const rawToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    console.log('JwtStrategy.validate - Authorization header:', authHeader || '<none>');
    console.log('JwtStrategy.validate - Raw token:', rawToken || '<none>');

    // Log payload and its type
    console.log('JwtStrategy.validate - Payload (raw):', payload);
    console.log('JwtStrategy.validate - Payload type:', typeof payload);

    // Basic payload validation and helpful logs to trace 500 errors
    const missingFields: string[] = [];
    if (!payload || typeof payload !== 'object') {
      console.warn('JwtStrategy.validate - Payload is missing or not an object');
    } else {
      if (!('sub' in payload) || payload.sub === undefined || payload.sub === null) missingFields.push('sub');
      // Check common username fields (adjust according to your payload shape)
      if (!('username' in payload) && !('nombreUsuario' in payload) && !('email' in payload)) missingFields.push('username/nombreUsuario/email');
      if (!('iat' in payload)) missingFields.push('iat');
      if (!('exp' in payload)) missingFields.push('exp');
    }

    if (missingFields.length) {
      console.warn('JwtStrategy.validate - Payload missing fields:', missingFields.join(', '));
    }

    try {
      console.log('JwtStrategy.validate - Looking for user ID (payload.sub):', (payload as any)?.sub);
      const usuario = await this.usuariosService.findOne((payload as any).sub);
      if (!usuario) {
        console.log('JwtStrategy.validate - User not found for id:', (payload as any)?.sub);
        throw new UnauthorizedException();
      }
      console.log('JwtStrategy.validate - User found (raw):', usuario && (usuario.nombreUsuario || usuario.email) ? (usuario.nombreUsuario || usuario.email) : usuario);

      // Normalize user object returned to avoid controller code accessing undefined fields
      const u: any = usuario as any;
      const normalizedUser: any = {
        // prefer explicit id fields
        sub: (payload as any)?.sub || u._id || u.id,
        id: u.id || u._id || (payload as any)?.sub,
        _id: u._id || u.id || (payload as any)?.sub,
        nombreUsuario: u.nombreUsuario || u.nombre || u.name || u.email,
        nombre: u.nombre || u.name || u.nombreUsuario,
        name: u.name || u.nombre || u.nombreUsuario,
        email: u.email,
        imagenPerfil: u.imagenPerfil || u.userPhoto || null,
        perfil: u.perfil || (payload as any)?.perfil || 'usuario',
        // include any other useful fields without mongoose prototypes
        roles: u.roles || [],
      };

      console.log('JwtStrategy.validate - Normalized user for request.user:', normalizedUser);
      return normalizedUser;
    } catch (error) {
      // Log full error to help debugging 500 cases
      console.error('JwtStrategy.validate - Error while validating token/user:', error && (error.stack || error.message) ? (error.stack || error.message) : error);
      // Re-throw as Unauthorized so Passport returns 401 rather than letting unknown errors bubble
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }
  }
}