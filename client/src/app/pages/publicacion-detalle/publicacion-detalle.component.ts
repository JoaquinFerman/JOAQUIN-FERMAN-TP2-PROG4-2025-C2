import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../services/posts.service';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicacion-detalle.component.html',
  styleUrl: './publicacion-detalle.component.css'
})
export class PublicacionDetalleComponent implements OnInit {
  publicacion: any = null;
  comentarios: any[] = [];
  currentPage = 1;
  hasMore = false;
  isLoading = false;
  editingCommentId: string | null = null;
  editingCommentContent: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPublicacion(id);
      this.loadComentarios(id);
    }
  }

  loadPublicacion(id: string) {
    this.postsService.findOne(id).subscribe({
      next: (publicacion) => {
        this.publicacion = publicacion;
      },
      error: (error) => {
        console.error('Error al cargar publicación:', error);
        this.router.navigate(['/publicaciones']);
      }
    });
  }

  loadComentarios(postId: string, page: number = 1) {
    this.isLoading = true;
    this.postsService.getCommentsPaginated(postId, page, 10).subscribe({
      next: (response) => {
        if (page === 1) {
          this.comentarios = response.comments;
        } else {
          this.comentarios = [...this.comentarios, ...response.comments];
        }
        this.currentPage = response.page;
        this.hasMore = response.hasMore;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar comentarios:', error);
        this.isLoading = false;
      }
    });
  }

  cargarMas() {
    if (this.publicacion?._id && this.hasMore && !this.isLoading) {
      this.loadComentarios(this.publicacion._id, this.currentPage + 1);
    }
  }

  iniciarEdicion(comentario: any) {
    this.editingCommentId = comentario._id;
    this.editingCommentContent = comentario.content;
  }

  cancelarEdicion() {
    this.editingCommentId = null;
    this.editingCommentContent = '';
  }

  guardarEdicion(postId: string, commentId: string) {
    if (!this.editingCommentContent.trim()) {
      return;
    }

    this.postsService.editComment(postId, commentId, this.editingCommentContent).subscribe({
      next: () => {
        // Actualizar el comentario en la lista local
        const comentario = this.comentarios.find(c => c._id === commentId);
        if (comentario) {
          comentario.content = this.editingCommentContent;
          comentario.modified = true;
          comentario.modifiedAt = new Date();
        }
        this.cancelarEdicion();
      },
      error: (error) => {
        console.error('Error al editar comentario:', error);
      }
    });
  }

  volver() {
    this.router.navigate(['/publicaciones']);
  }

  isOwner(comment: any): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub || payload.id;
      return String(comment.userId) === String(userId);
    } catch {
      return false;
    }
  }

  verImagenCompleta(imagenUrl: string) {
    const modal = document.createElement('div');
    modal.className = 'modal-imagen-completa';
    modal.innerHTML = `
      <div class="modal-backdrop" style="position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: flex; justify-content: center; align-items: center; z-index: 9999; cursor: pointer; padding: 2rem;">
        <img src="${imagenUrl}" style="max-width: 95%; max-height: 95vh; object-fit: contain; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);" alt="Imagen completa">
      </div>
    `;
    
    modal.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    document.body.appendChild(modal);
  }
}
