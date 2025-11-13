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
  Query,
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
  async create(@Request() req, @Body() createPublicacioneDto: CreatePublicacioneDto) {
    console.log('🎯 POST /publicaciones - REQUEST RECIBIDO');
    console.log('🎯 Headers:', req.headers?.authorization);
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
      userName: user.nombreUsuario || user.nombre || user.name,
      userPhoto: user.imagenPerfil || user.userPhoto || null,
      isOwn: true,
    } as any;
    try {
      const result = await this.publicacionesService.create(payload);
      return result;
    } catch (err) {
      console.error('Error creating publication:', err?.message || err, err?.stack);
      throw new (require('@nestjs/common').InternalServerErrorException)('Error interno al crear la publicación');
    }
  }

  @Get()
  findAll(
    @Query('order') order?: 'fecha' | 'meGusta',
    @Query('userId') userId?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const opts: any = {};
    if (order) opts.order = order;
    if (userId) opts.userId = userId;
    if (offset) opts.offset = Number(offset);
    if (limit) opts.limit = Number(limit);
    return this.publicacionesService.findAll(opts);
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
      roles: user.roles || [],
    };
    return this.publicacionesService.remove(id, userPayload as any);
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  addComment(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { content: string; date?: Date },
  ) {
    // Use authenticated user info instead of trusting client-provided userName/userPhoto
    const user = req.user || {};
    const userName = user.nombreUsuario || user.nombre || user.name;
    const userPhoto = user.imagenPerfil || user.userPhoto || null;

    console.log(`POST /publicaciones/${id}/comment body (from client):`, body);
    console.log(`Authenticated user for comment:`, { id: user.sub || user.id || user._id, userName, userPhoto });

    if (!body || typeof body.content !== 'string' || !body.content.trim()) {
      throw new BadRequestException('El contenido del comentario es requerido');
    }

    const comment = {
      userName,
      userPhoto,
      content: body.content.trim(),
      date: body.date ? new Date(body.date) : new Date(),
    } as any;

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
  async uploadPublicationImage(
    @Request() req,
    @Param('id') id: string,
    @Query('imageIndex') imageIndex: string,
    @UploadedFile() file: Express.Multer.File
  ) {
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

    // Use naming convention: postId:imageIndex
    const filename = `${id}:${imageIndex || '1'}${extname(file.originalname)}`;
    const path = `posts/${filename}`;
    const url = await this.supabaseService.uploadFile('publicaciones', path, file.buffer, file.mimetype as string);

    // attach image url to the publication document
    const updated = await this.publicacionesService.update(id, { imageUrl: url } as any);
    return { imageUrl: url, filename, publication: updated };
  }

  @Post(':id/unlike')
  unlike(@Param('id') id: string, @Body('userId') userId: string) {
    console.log(`POST /publicaciones/${id}/unlike body:`, userId);
    return this.publicacionesService.unlike(id, userId);
  }

  @Get('last-three')
  async getLastThreePosts(@Request() req) {
    const userId = req.user.id;
    return this.publicacionesService.findLastThreeByUser(userId);
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.publicacionesService.getCommentsPaginated(id, pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments/:commentId/edit')
  async editComment(
    @Request() req,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() body: { content: string },
  ) {
    const user = req.user || {};
    const userId = user.sub || user.id || user._id;
    
    if (!body || typeof body.content !== 'string' || !body.content.trim()) {
      throw new BadRequestException('El contenido del comentario es requerido');
    }

    return this.publicacionesService.editComment(postId, commentId, userId, body.content.trim());
  }
}

