import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, UseGuards } from '@nestjs/common';
import { LowercasePipe } from '../pipes/lowercase.pipe';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UsePipes(LowercasePipe)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // Endpoint para que admin cree nuevos usuarios
  @Post('admin/crear')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createByAdmin(@Body() createUsuarioDto: CreateUsuarioDto) {
    // Aplicar lowercase solo a email y nombreUsuario, NO a password
    const processedDto = {
      ...createUsuarioDto,
      email: createUsuarioDto.email?.toLowerCase(),
      nombreUsuario: createUsuarioDto.nombreUsuario?.toLowerCase()
    };
    return this.usuariosService.create(processedDto);
  }

  // Listar todos los usuarios (solo admin)
  @Get('admin/listar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin() {
    return this.usuariosService.findAllIncludingInactive();
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(LowercasePipe)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    console.log('PATCH /usuarios/:id - ID:', id);
    console.log('PATCH /usuarios/:id - Body:', updateUsuarioDto);
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  // Baja lógica (deshabilitar usuario) - solo admin
  @Post('admin/:id/deshabilitar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  disable(@Param('id') id: string) {
    return this.usuariosService.disable(id);
  }

  // Alta lógica (habilitar usuario) - solo admin
  @Post('admin/:id/habilitar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  enable(@Param('id') id: string) {
    return this.usuariosService.enable(id);
  }
}
