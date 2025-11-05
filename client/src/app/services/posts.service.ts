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

  getAllPaginated(options?: { order?: 'fecha' | 'meGusta'; userId?: string; offset?: number; limit?: number }): Observable<any> {
    let params: any = {};
    if (options?.order) params.order = options.order;
    if (options?.userId) params.userId = options.userId;
    if (typeof options?.offset === 'number') params.offset = String(options.offset);
    if (typeof options?.limit === 'number') params.limit = String(options.limit);
    return this.http.get<any>(this.apiUrl, { params });
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
