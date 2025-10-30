import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Verificar si el email ya existe
    const existingEmail = await this.usuarioModel.findOne({ 
      email: createUsuarioDto.email 
    });
    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el nombre de usuario ya existe
    const existingUsername = await this.usuarioModel.findOne({ 
      nombreUsuario: createUsuarioDto.nombreUsuario 
    });
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Validar edad mínima (13 años)
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

    // Validar contraseña
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

    return usuario.save();
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
    // Verificar si el email ya existe (si se está actualizando)
    if (updateUsuarioDto.email) {
      const existingEmail = await this.usuarioModel.findOne({ 
        email: updateUsuarioDto.email,
        _id: { $ne: id }
      });
      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Verificar si el nombre de usuario ya existe (si se está actualizando)
    if (updateUsuarioDto.nombreUsuario) {
      const existingUsername = await this.usuarioModel.findOne({ 
        nombreUsuario: updateUsuarioDto.nombreUsuario,
        _id: { $ne: id }
      });
      if (existingUsername) {
        throw new ConflictException('El nombre de usuario ya está en uso');
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
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async remove(id: string): Promise<void> {
    const result = await this.usuarioModel.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async validatePassword(user: Usuario, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
