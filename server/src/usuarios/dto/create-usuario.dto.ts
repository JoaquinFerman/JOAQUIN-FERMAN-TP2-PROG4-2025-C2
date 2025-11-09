import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  apellido: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  nombreUsuario: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsDateString()
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  imagenPerfil?: string;
}
