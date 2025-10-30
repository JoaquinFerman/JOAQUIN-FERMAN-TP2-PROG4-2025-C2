import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';



export interface JwtPayload {
  sub: string;
  email: string;
  nombreUsuario: string;
  perfil: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async register(createUsuarioDto: CreateUsuarioDto, imagenPerfil?: string) {
    try {
      const usuarioDto = {
        ...createUsuarioDto,
        ...(imagenPerfil && { imagenPerfil })
      };

      const usuario = await this.usuariosService.create(usuarioDto);
      
      // No devolver la contraseña
      const { password, ...result } = (usuario as any).toObject();
      
      return {
        message: 'Usuario registrado exitosamente',
        usuario: result
      };
    } catch (error) {
      throw error;
    }
  }

  async validateUser(emailOrUsername: string, password: string) {
    // Buscar por email
    let usuario = await this.usuariosService.findByEmail(emailOrUsername);
    this.logger.debug(`Buscando usuario por email: ${emailOrUsername}`);
    if (usuario) {
      this.logger.debug(`Usuario encontrado por email: ${usuario.email}`);
      const passwordValid = await this.usuariosService.validatePassword(usuario, password);
      this.logger.debug(`Password válida por email: ${passwordValid}`);
      if (passwordValid) {
        const { password, ...result } = (usuario as any).toObject();
        return result;
      }
    }
    // Si no se encontró por email, buscar por nombreUsuario
    usuario = await this.usuariosService.findByNombreUsuario(emailOrUsername);
    this.logger.debug(`Buscando usuario por nombreUsuario: ${emailOrUsername}`);
    if (usuario) {
      this.logger.debug(`Usuario encontrado por nombreUsuario: ${usuario.nombreUsuario}`);
      const passwordValid = await this.usuariosService.validatePassword(usuario, password);
      this.logger.debug(`Password válida por nombreUsuario: ${passwordValid}`);
      if (passwordValid) {
        const { password, ...result } = (usuario as any).toObject();
        return result;
      }
    }
    this.logger.warn(`No se encontró usuario válido para: ${emailOrUsername}`);
    return null;
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.validateUser(loginDto.emailOrUsername, loginDto.password);
    
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    
    const payload: JwtPayload = {
      sub: usuario._id,
      email: usuario.email,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
        
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        nombreUsuario: usuario.nombreUsuario,
        imagenPerfil: usuario.imagenPerfil,
        perfil: usuario.perfil,
        fechaRegistro: usuario.fechaRegistro,
      }
    };
  }

  async getProfile(userId: string) {
    return this.usuariosService.findOne(userId);
  }
}
