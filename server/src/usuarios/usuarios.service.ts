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
    try {
      console.log('UsuariosService.findOne - Looking for user with ID:', id);
      const usuario = await this.usuarioModel.findById(id)
        .select('-password')
        .exec();
      
      if (!usuario) {
        console.log('UsuariosService.findOne - User not found for ID:', id);
        throw new NotFoundException('Usuario no encontrado');
      }
      
      console.log('UsuariosService.findOne - User found:', usuario.nombreUsuario);
      return usuario;
    } catch (error) {
      console.error('UsuariosService.findOne - Error:', error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Invalid ObjectId format or other database errors
      throw new NotFoundException('Usuario no encontrado o ID inválido');
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioModel.findOne({ email, activo: true }).exec();
  }

  async findByNombreUsuario(nombreUsuario: string): Promise<Usuario | null> {
    return this.usuarioModel.findOne({ nombreUsuario, activo: true }).exec();
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    console.log('UPDATE USER - ID:', id);
    console.log('UPDATE USER - DTO:', updateUsuarioDto);
    
    // Solo validar si se está intentando cambiar email o nombreUsuario
    if (updateUsuarioDto.email || updateUsuarioDto.nombreUsuario) {
      const currentUser = await this.usuarioModel.findById(id);
      if (!currentUser) {
        throw new NotFoundException('Usuario no encontrado');
      }
      
      console.log('UPDATE USER - Current user:', {
        email: currentUser.email,
        nombreUsuario: currentUser.nombreUsuario
      });

      // Build case-insensitive checks using regex so we detect existing docs
      const orConditions: Array<any> = [];
      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const newEmailRaw = updateUsuarioDto.email ? String(updateUsuarioDto.email) : undefined;
      const newNombreUsuarioRaw = updateUsuarioDto.nombreUsuario ? String(updateUsuarioDto.nombreUsuario) : undefined;
      const currentEmailRaw = currentUser.email ? String(currentUser.email) : undefined;
      const currentNombreUsuarioRaw = currentUser.nombreUsuario ? String(currentUser.nombreUsuario) : undefined;

      // Detectar cambios por comparación estricta (incluye cambios de mayúsculas)
      const changedEmail = typeof updateUsuarioDto.email !== 'undefined' && newEmailRaw !== currentEmailRaw;
      const changedNombre = typeof updateUsuarioDto.nombreUsuario !== 'undefined' && newNombreUsuarioRaw !== currentNombreUsuarioRaw;

      if (changedEmail) {
        const re = { $regex: `^${escapeRegex(newEmailRaw || '')}$`, $options: 'i' };
        console.log('UPDATE USER - Email change detected (strict):', currentEmailRaw, '->', newEmailRaw, 'using regex', re);
        orConditions.push({ email: re });
        orConditions.push({ nombreUsuario: re });
      }

      if (changedNombre) {
        const re = { $regex: `^${escapeRegex(newNombreUsuarioRaw || '')}$`, $options: 'i' };
        console.log('UPDATE USER - NombreUsuario change detected (strict):', currentNombreUsuarioRaw, '->', newNombreUsuarioRaw, 'using regex', re);
        orConditions.push({ email: re });
        orConditions.push({ nombreUsuario: re });
      }

      console.log('UPDATE USER - Conditions to check (regex):', JSON.stringify(orConditions));

      if (orConditions.length > 0) {
        const exists = await this.usuarioModel.findOne({
          $or: orConditions,
          _id: { $ne: id }
        });
        console.log('UPDATE USER - Existing user found:', exists);
        if (exists) {
          throw new ConflictException('El email o nombre de usuario ya está en uso, y ambos deben ser únicos entre sí');
        }
      } else {
        console.log('UPDATE USER - No validation needed, values unchanged');
      }
    } else {
      console.log('UPDATE USER - No email or nombreUsuario in update');
    }

    let usuario: Usuario | null = null;
    try {
      usuario = await this.usuarioModel.findByIdAndUpdate(
        id,
        { 
          ...updateUsuarioDto,
          ...(updateUsuarioDto.fechaNacimiento && { 
            fechaNacimiento: new Date(updateUsuarioDto.fechaNacimiento) 
          })
        },
        { new: true }
      ).select('-password').exec();
    } catch (err: any) {
      // Capturar errores de duplicado a nivel de índice (MongoDB E11000)
      if (err && (err.code === 11000 || err.code === 11001)) {
        const kv = err.keyValue ? JSON.stringify(err.keyValue) : String(err);
        this.logger.warn('Mongo duplicate key error on update: ' + kv);
        throw new ConflictException('El email o nombre de usuario ya está en uso (conflicto de índice)');
      }
      // Re-throw para otros tipos de error
      throw err;
    }

    if (!usuario) {
      this.logger.error(`Usuario no encontrado: ${id}`);
      throw new NotFoundException('Usuario no encontrado');
    }
  this.logger.log(`Usuario actualizado: ${(usuario as any)?._id || (usuario as any)?.id}`);
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
