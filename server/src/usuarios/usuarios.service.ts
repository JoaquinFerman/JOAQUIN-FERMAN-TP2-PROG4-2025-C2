import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { AppLogger } from '../logger/logger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const exists = await this.usuarioModel.findOne({
      $or: [
        { email: createUsuarioDto.email },
        { nombreUsuario: createUsuarioDto.email },
        { email: createUsuarioDto.nombreUsuario },
        { nombreUsuario: createUsuarioDto.nombreUsuario }
      ]
    });
    if (exists) {
      this.logger.warn(`Intento de registro con email o nombre de usuario duplicado: ${createUsuarioDto.email}, ${createUsuarioDto.nombreUsuario}`);
      throw new ConflictException('El email o nombre de usuario ya está en uso, y ambos deben ser únicos entre sí');
    }

    const birthDate = new Date(createUsuarioDto.fechaNacimiento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 13) {
        throw new ConflictException('Debes ser mayor de 13 años para registrarte');
      }
    } else if (age < 13) {
      throw new ConflictException('Debes ser mayor de 13 años para registrarte');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(createUsuarioDto.password)) {
      throw new ConflictException('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, saltRounds);

    // Crear usuario
    const usuario = new this.usuarioModel({
      ...createUsuarioDto,
      password: hashedPassword,
      fechaNacimiento: new Date(createUsuarioDto.fechaNacimiento),
    });

  const saved = await usuario.save();
  this.logger.log(`Usuario creado: ${saved._id} (${saved.email}, ${saved.nombreUsuario})`);
  return saved;
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioModel.find({ activo: true })
      .select('-password')
      .exec();
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id)
      .select('-password')
      .exec();
    
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioModel.findOne({ email, activo: true }).exec();
  }

  async findByNombreUsuario(nombreUsuario: string): Promise<Usuario | null> {
    return this.usuarioModel.findOne({ nombreUsuario, activo: true }).exec();
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const orConditions: Array<{ email?: string; nombreUsuario?: string }> = [];
    if (updateUsuarioDto.email) {
      orConditions.push({ email: updateUsuarioDto.email });
      orConditions.push({ nombreUsuario: updateUsuarioDto.email });
    }
    if (updateUsuarioDto.nombreUsuario) {
      orConditions.push({ email: updateUsuarioDto.nombreUsuario });
      orConditions.push({ nombreUsuario: updateUsuarioDto.nombreUsuario });
    }
    if (orConditions.length > 0) {
      const exists = await this.usuarioModel.findOne({
        $or: orConditions,
        _id: { $ne: id }
      });
      if (exists) {
        throw new ConflictException('El email o nombre de usuario ya está en uso, y ambos deben ser únicos entre sí');
      }
    }

    const usuario = await this.usuarioModel.findByIdAndUpdate(
      id,
      { 
        ...updateUsuarioDto,
        ...(updateUsuarioDto.fechaNacimiento && { 
          fechaNacimiento: new Date(updateUsuarioDto.fechaNacimiento) 
        })
      },
      { new: true }
    ).select('-password').exec();

    if (!usuario) {
      this.logger.error(`Usuario no encontrado: ${id}`);
      throw new NotFoundException('Usuario no encontrado');
    }
    this.logger.log(`Usuario actualizado: ${usuario._id}`);
    return usuario;
  }

  async remove(id: string): Promise<void> {
    const result = await this.usuarioModel.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!result) {
      this.logger.error(`Usuario no encontrado para eliminar: ${id}`);
      throw new NotFoundException('Usuario no encontrado');
    }
    this.logger.log(`Usuario eliminado (desactivado): ${id}`);
  }

  async validatePassword(user: Usuario, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
