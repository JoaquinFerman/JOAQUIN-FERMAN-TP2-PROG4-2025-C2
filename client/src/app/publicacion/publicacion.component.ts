import { Component, Input } from '@angular/core';
import { ComentarioComponent } from "../comentario/comentario.component";
import { CommonModule } from '@angular/common';
import { PostsService } from '../services/posts.service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.css'],
  imports: [ComentarioComponent, CommonModule]
})
export class PublicacionComponent {
  @Input() data: any;
  expandida = false;
  
  constructor(private postsService: PostsService, private authService: AuthService) {}
  
  like() {
    const userId = this.getUserId();
    if (!userId) {
      console.error('No se pudo obtener el userId para dar like');
      return;
    }
    console.log('Enviando like para post:', this.data._id, 'userId:', userId);
    this.postsService.like(this.data._id, userId).subscribe({
      next: (post) => {
        console.log('Like agregado exitosamente:', post);
        this.data.liked = true;
        this.data.likesCount = post.likesCount;
      },
      error: (err) => {
        console.error('Error al dar like:', err);
      }
    });
  }

  unlike() {
    const userId = this.getUserId();
    if (!userId) {
      console.error('No se pudo obtener el userId para quitar like');
      return;
    }
    console.log('Enviando unlike para post:', this.data._id, 'userId:', userId);
    this.postsService.unlike(this.data._id, userId).subscribe({
      next: (post) => {
        console.log('Unlike exitoso:', post);
        this.data.liked = false;
        this.data.likesCount = post.likesCount;
      },
      error: (err) => {
        console.error('Error al quitar like:', err);
      }
    });
  }

  onAddComment(event: Event, input: HTMLInputElement) {
    event.preventDefault();
    const value = input.value.trim();
    if (value) {
      this.addComment(value);
      input.value = '';
    }
  }

  getUserId(): string | null {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token de autenticación');
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT Payload:', payload);
      // El backend usa 'sub' como userId
      const userId = payload.sub || payload.userId || payload.id || null;
      console.log('UserId extraído:', userId);
      return userId;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  isMyPost(): boolean {
    const userId = this.getUserId();
    if (!userId || !this.data) return false;
    return String(this.data.userId) === String(userId);
  }

  deletePost() {
    this.postsService.delete(this.data._id).subscribe(() => {
      this.data.deleted = true;
    });
  }

  addComment(content: string) {
    // El servidor ahora usa JwtAuthGuard y completa userName/userPhoto desde el token
    // Solo enviamos el contenido
    const comment = {
      content,
      date: new Date()
    };
    console.log('Enviando comentario:', comment);
    this.postsService.addComment(this.data._id, comment).subscribe({
      next: (post) => {
        console.log('Comentario agregado exitosamente:', post);
        this.data.comments = post.comments;
      },
      error: (err) => {
        console.error('Error al agregar comentario:', err);
      }
    });
  }

  getUserName(): string | null {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token de autenticación');
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // El backend usa 'nombreUsuario'
      const userName = payload.nombreUsuario || payload.userName || payload.username || payload.name || null;
      console.log('UserName extraído:', userName);
      return userName;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  getUserPhoto(): string | null {
    const token = this.authService.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // El backend usa 'imagenPerfil' pero no está en el JWT, solo en el objeto usuario
      return payload.imagenPerfil || payload.userPhoto || payload.photo || null;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  cargarMasComentarios() {
    console.log('Cargando más comentarios...');
    // Lógica para cargar más comentarios
  }
}
