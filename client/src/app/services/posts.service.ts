import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private apiUrl = `${API_BASE}/publicaciones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(post: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, post);
  }

  update(id: string, post: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, post);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  addComment(postId: string, comment: any): Observable<any> {
    if (!comment) throw new Error('Comentario no puede ser undefined');
    return this.http.post<any>(
      `${this.apiUrl}/${postId}/comment`,
      comment,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  like(postId: string, userId: string): Observable<any> {
    if (!userId) throw new Error('userId no puede ser undefined');
    return this.http.post<any>(
      `${this.apiUrl}/${postId}/like`,
      { userId },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  unlike(postId: string, userId: string): Observable<any> {
    if (!userId) throw new Error('userId no puede ser undefined');
    return this.http.post<any>(
      `${this.apiUrl}/${postId}/unlike`,
      { userId },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
