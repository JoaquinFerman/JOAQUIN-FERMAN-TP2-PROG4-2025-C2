import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // Cantidad de publicaciones por usuario en un lapso de tiempo
  @Get('publicaciones-por-usuario')
  async getPublicacionesPorUsuario(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.publicacionesService.getPublicacionesPorUsuario(fechaInicio, fechaFin);
  }

  // Cantidad de comentarios realizados en un lapso de tiempo
  @Get('comentarios-totales')
  async getComentariosTotales(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.publicacionesService.getComentariosTotales(fechaInicio, fechaFin);
  }

  // Cantidad de comentarios en cada publicación en un lapso de tiempo
  @Get('comentarios-por-publicacion')
  async getComentariosPorPublicacion(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.publicacionesService.getComentariosPorPublicacion(fechaInicio, fechaFin);
  }
}
