import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${API_BASE}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: { emailOrUsername: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  validarToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/autorizar`, { token });
  }

  refrescarToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/refrescar`, { token });
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.perfil === 'administrador';
    } catch {
      return false;
    }
  }

  getUserProfile(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.id,
        email: payload.email,
        nombreUsuario: payload.nombreUsuario,
        perfil: payload.perfil,
        imagenPerfil: payload.imagenPerfil
      };
    } catch {
      return null;
    }
  }
}
