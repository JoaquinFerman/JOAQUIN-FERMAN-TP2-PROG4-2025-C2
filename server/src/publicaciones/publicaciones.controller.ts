import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { SupabaseService } from '../supabase/supabase.service';
import { PublicacionesService } from './publicaciones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { UpdatePublicacioneDto } from './dto/update-publicacione.dto';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createPublicacioneDto: CreatePublicacioneDto) {
    // attach owner info from authenticated user (JWT)
    const user = req.user;
    console.log('POST /publicaciones body:', createPublicacioneDto);
    console.log('Authenticated user:', user);
    // Basic validation
    if (!createPublicacioneDto || typeof createPublicacioneDto.content !== 'string' || !createPublicacioneDto.content.trim()) {
      throw new BadRequestException('El contenido de la publicación es requerido');
    }
    const payload = {
      ...createPublicacioneDto,
      userId: user.sub || user.id || user._id,
      userName: user.nombre || user.nombreUsuario || user.name,
      userPhoto: user.imagenPerfil || user.userPhoto || null,
      isOwn: true,
    } as any;
    try {
      return this.publicacionesService.create(payload);
    } catch (err) {
      console.error('Error creating publication:', err?.message || err, err?.stack);
      throw new (require('@nestjs/common').InternalServerErrorException)('Error interno al crear la publicación');
    }
  }

  @Get()
  findAll() {
    return this.publicacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicacionesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    const user = req.user || {};
    const userPayload = {
      id: user.sub || user.id || user._id,
      nombreUsuario: user.nombreUsuario || user.nombre,
      nombre: user.nombre || user.nombreUsuario,
    };
    return this.publicacionesService.remove(id, userPayload as any);
  }

  @Post(':id/comment')
  addComment(
    @Param('id') id: string,
    @Body() comment: { userName: string; userPhoto?: string; content: string; date?: Date },
  ) {
    console.log(`POST /publicaciones/${id}/comment body:`, comment);
    // Basic validation
    if (!comment || typeof comment.content !== 'string' || !comment.content.trim()) {
      throw new BadRequestException('El contenido del comentario es requerido');
    }
    if (!comment.userName || typeof comment.userName !== 'string') {
      throw new BadRequestException('El userName del comentario es requerido');
    }
    return this.publicacionesService.addComment(id, comment);
  }

  @Post(':id/like')
  like(@Param('id') id: string, @Body('userId') userId: string) {
    console.log(`POST /publicaciones/${id}/like body:`, userId);
    return this.publicacionesService.like(id, userId);
  }

  @Post(':id/upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Solo se permiten archivos de imagen'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async uploadPublicationImage(@Request() req, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Verify that the authenticated user is the owner of the publication
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    const post = await this.publicacionesService.findOne(id);
    if (!post) throw new BadRequestException('Publicación no encontrada');
    if (String((post as any).userId) !== String(userId)) {
      throw new BadRequestException('No permitido: solo el dueño puede subir imágenes a esta publicación');
    }

    const randomName =
      Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('') + extname(file.originalname);
    const path = `publicaciones/${id}/${randomName}`;
    const url = await this.supabaseService.uploadFile('publicaciones', path, file.buffer, file.mimetype as string);

    // attach image url to the publication document
    const updated = await this.publicacionesService.update(id, { imageUrl: url } as any);
    return { imageUrl: url, filename: randomName, publication: updated };
  }

  @Post(':id/unlike')
  unlike(@Param('id') id: string, @Body('userId') userId: string) {
    console.log(`POST /publicaciones/${id}/unlike body:`, userId);
    return this.publicacionesService.unlike(id, userId);
  }
}

