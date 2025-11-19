import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

export interface Usuario {
  _id?: string;
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  fechaNacimiento: Date | string;
  imagenPerfil?: string;
  perfil: 'usuario' | 'administrador';
  activo: boolean;
  fechaRegistro?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${API_BASE}/usuarios`;

  constructor(private http: HttpClient) {}

  // Listar todos los usuarios (incluye inactivos) - solo admin
  listarTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/admin/listar`);
  }

  // Crear usuario por admin
  crearUsuario(usuario: any): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/admin/crear`, usuario);
  }

  // Deshabilitar usuario - solo admin
  deshabilitarUsuario(id: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/admin/${id}/deshabilitar`, {});
  }

  // Habilitar usuario - solo admin
  habilitarUsuario(id: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/admin/${id}/habilitar`, {});
  }

  // Obtener un usuario específico
  obtenerUsuario(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }
}
