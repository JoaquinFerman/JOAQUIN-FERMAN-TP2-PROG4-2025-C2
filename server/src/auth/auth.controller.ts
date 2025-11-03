import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFile, 
  Get, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpCode,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly supabaseService: SupabaseService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('imagenPerfil', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Solo se permiten archivos de imagen'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imagenPerfil: string | undefined = undefined;
    if (file && file.buffer) {
      const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('') + extname(file.originalname);
      const path = `usuarios/${randomName}`;
      imagenPerfil = await this.supabaseService.uploadFile('usuarios', path, file.buffer, file.mimetype as string);
    }
    return this.authService.register(createUsuarioDto, imagenPerfil);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Solo se permiten archivos de imagen'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @HttpCode(HttpStatus.OK)
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('') + extname(file.originalname);
    const path = `usuarios/${randomName}`;
    try {
      const url = await this.supabaseService.uploadFile('usuarios', path, file.buffer, file.mimetype as string);
      return { imagenUrl: url, filename: randomName };
    } catch (err) {
      // Log server-side and rethrow a clearer internal error so the client gets the message
      console.error('[AuthController] uploadImage error:', err?.message || err);
      throw new Error('Error uploading image: ' + (err?.message || err));
    }
  }
}
