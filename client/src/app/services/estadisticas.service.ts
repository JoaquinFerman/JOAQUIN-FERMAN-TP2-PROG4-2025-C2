import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

export interface PublicacionesPorUsuario {
  userId: string;
  userName: string;
  cantidadPublicaciones: number;
}

export interface ComentariosTotales {
  total: number;
  porFecha: {
    fecha: string;
    cantidad: number;
  }[];
}

export interface ComentariosPorPublicacion {
  publicacionId: string;
  userName: string;
  content: string;
  cantidadComentarios: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl = `${API_BASE}/estadisticas`;

  constructor(private http: HttpClient) {}

  // Obtener publicaciones por usuario en un lapso de tiempo
  getPublicacionesPorUsuario(fechaInicio?: string, fechaFin?: string): Observable<PublicacionesPorUsuario[]> {
    let params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    return this.http.get<PublicacionesPorUsuario[]>(`${this.apiUrl}/publicaciones-por-usuario`, { params });
  }

  // Obtener cantidad de comentarios totales en un lapso de tiempo
  getComentariosTotales(fechaInicio?: string, fechaFin?: string): Observable<ComentariosTotales> {
    let params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    return this.http.get<ComentariosTotales>(`${this.apiUrl}/comentarios-totales`, { params });
  }

  // Obtener comentarios por publicación en un lapso de tiempo
  getComentariosPorPublicacion(fechaInicio?: string, fechaFin?: string): Observable<ComentariosPorPublicacion[]> {
    let params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    return this.http.get<ComentariosPorPublicacion[]>(`${this.apiUrl}/comentarios-por-publicacion`, { params });
  }
}
