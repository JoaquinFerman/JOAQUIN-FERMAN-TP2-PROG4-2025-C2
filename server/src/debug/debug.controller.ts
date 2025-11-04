import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('debug')
export class DebugController {
  constructor(@InjectConnection() private connection: Connection) {}

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

  @Get('mongo-test')
  async testMongo() {
    try {
      const readyState = this.connection.readyState;
      const dbName = this.connection.name;
      
      if (!this.connection.db) {
        return {
          success: false,
          error: 'Database not initialized',
          mongooseReadyState: readyState,
        };
      }
      
      // Intentar leer usuarios directamente
      const usersCollection = this.connection.db.collection('users');
      const userCount = await usersCollection.countDocuments();
      const users = await usersCollection.find({}).limit(3).toArray();
      
      return {
        success: true,
        mongooseReadyState: readyState,
        readyStateDescription: {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting',
        }[readyState],
        databaseName: dbName,
        userCount,
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          nombreUsuario: u.nombreUsuario,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        mongooseReadyState: this.connection.readyState,
      };
    }
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
