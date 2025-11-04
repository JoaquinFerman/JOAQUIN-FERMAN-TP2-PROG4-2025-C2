import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('debug')
export class DebugController {
  @Get('env')
  getEnvInfo() {
    return {
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriStart: process.env.MONGODB_URI?.substring(0, 30) || 'NOT SET',
      hasJwtSecret: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_KEY,
      nodeEnv: process.env.NODE_ENV,
    };
  }

  @Post('test-auth')
  @UseGuards(JwtAuthGuard)
  testAuth(@Request() req, @Body() body: any) {
    const user = req.user;
    return {
      authenticated: true,
      user: {
        _id: user._id,
        sub: user.sub,
        id: user.id,
        nombre: user.nombre,
        nombreUsuario: user.nombreUsuario,
        name: user.name,
        email: user.email,
        imagenPerfil: user.imagenPerfil,
      },
      body,
      extractedFields: {
        userId: user.sub || user.id || user._id,
        userName: user.nombreUsuario || user.nombre || user.name,
        userPhoto: user.imagenPerfil || user.userPhoto || null,
      }
    };
  }
}
