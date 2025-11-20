import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../services/auth';
import { PostsService } from '../services/posts.service';
import { NotificationService } from '../services/notification.service';
import { API_BASE } from '../config';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, DatePipe]
})
export class MiPerfilComponent {
  @Input() usuario: any;
  @Input() publicaciones: any[] = [];
  @Output() cerrarPerfil = new EventEmitter<void>();
  
  editMode = false;
  usuarioEdit: any = {};
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private notificationService: NotificationService,
    private postsService: PostsService
  ) {}

  editar() {
    this.editMode = true;
    // Crear una copia limpia con campos normalizados
    this.usuarioEdit = {
      nombre: this.usuario.nombre,
      apellido: this.usuario.apellido,
      email: this.usuario.email,
      nombreUsuario: this.usuario.nombreUsuario || this.usuario.username
    };
  }

  cancelarEdicion() {
    this.editMode = false;
    this.usuarioEdit = {};
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.notificationService.error('Por favor selecciona una imagen válida');
        return;
      }
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error('La imagen no debe superar los 5MB');
        return;
      }
      
      this.selectedFile = file;
      
      // Generar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  guardarEdicion() {
    // Preparar solo los campos que se pueden editar
    const datos: any = {};
    
    if (this.usuarioEdit.nombre?.trim()) {
      datos.nombre = this.usuarioEdit.nombre.trim();
    }
    if (this.usuarioEdit.apellido?.trim()) {
      datos.apellido = this.usuarioEdit.apellido.trim();
    }
    if (this.usuarioEdit.email?.trim()) {
      datos.email = this.usuarioEdit.email.trim();
    }
    if (this.usuarioEdit.nombreUsuario?.trim()) {
      datos.nombreUsuario = this.usuarioEdit.nombreUsuario.trim();
    }
    
    const userId = this.usuario._id || this.usuario.id;
    console.log('Datos a enviar:', datos);
    
    // Si hay una nueva imagen, primero subirla
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      
  this.http.post<any>(`${API_BASE}/auth/upload-image`, formData).subscribe({
        next: (response) => {
          console.log('Imagen subida:', response);
          datos.imagenPerfil = response.imagenUrl;
          this.actualizarPerfil(userId, datos);
        },
        error: (err) => {
          console.error('Error al subir imagen:', err);
          this.notificationService.error('Error al subir la imagen. Intenta de nuevo.');
        }
      });
    } else {
      this.actualizarPerfil(userId, datos);
    }
  }

  private actualizarPerfil(userId: string, datos: any) {
  this.http.patch(`${API_BASE}/usuarios/${userId}`, datos).subscribe({
      next: (resp: any) => {
        console.log('Respuesta del servidor:', resp);
        Object.assign(this.usuario, resp);
        this.editMode = false;
        this.usuarioEdit = {};
        this.selectedFile = null;
        this.previewUrl = null;
        this.notificationService.success('Perfil actualizado exitosamente');
      },
      error: (err) => {
        console.error('Error al actualizar perfil:', err);
        this.notificationService.error('Error al actualizar el perfil. Por favor, intenta de nuevo.');
      }
    });
  }

  cerrar() {
    this.cerrarPerfil.emit();
  }

  logout() {
    this.authService.logout();
    this.cerrarPerfil.emit();
    this.notificationService.info('Sesión cerrada exitosamente');
    // Recargar la página para limpiar el estado
    setTimeout(() => window.location.reload(), 1000);
  }

  get ultimosTresPosts() {
    return this.misPublicaciones.slice(0, 3);
  }

  get misPublicaciones() {
    const userId = this.usuario?.id || this.usuario?._id;
    if (!userId) return [];
    return this.publicaciones.filter(pub => 
      String(pub.userId) === String(userId)
    );
  }

  get cantidadPublicaciones() {
    return this.misPublicaciones.length;
  }

  publicacionExpandida: any = null;

  // Comentarios: edición inline
  editingCommentId: string | null = null;
  editingContent: string = '';

  verPublicacion(publicacionId: string) {
    // Encontrar y mostrar la publicación en modal
    const publicacion = this.misPublicaciones.find(p => (p._id || p.id) === publicacionId);
    if (publicacion) {
      this.publicacionExpandida = publicacion;
    }
  }

  // Inicia la edición de un comentario (solo si es del usuario actual)
  startEditComment(comment: any) {
    const me = this.authService.getUserProfile();
    const myId = me?.id || me?._id;
    const ownerId = comment.userId || comment.user || comment.userIdStr || comment.user._id || comment.userId;
    if (!myId || String(ownerId) !== String(myId)) return;

    this.editingCommentId = comment._id || comment.id;
    // Mostrar el contenido sin el sufijo [editado] si ya existe
    this.editingContent = (comment.content || '').replace(/\s*\[editado\]\s*$/i, '');
  }

  cancelEditComment() {
    this.editingCommentId = null;
    this.editingContent = '';
  }

  saveEditComment(comment: any) {
    if (!this.editingCommentId) return;
    const newContent = (this.editingContent || '').trim();
    if (!newContent) {
      this.notificationService.error('El comentario no puede quedar vacío');
      return;
    }

    const postId = this.publicacionExpandida._id || this.publicacionExpandida.id;
    const commentId = comment._id || comment.id;

    this.postsService.editComment(postId, commentId, newContent).subscribe({
      next: (resp) => {
        // Actualizar el comment en la UI: agregar indicador [editado] y marcar como modificado
        comment.content = newContent + ' [editado]';
        comment.edited = true;
        comment.modified = true;
        comment.modifiedAt = new Date();
        this.notificationService.success('Comentario editado');
        this.cancelEditComment();
      },
      error: (err) => {
        console.error('Error editando comentario:', err);
        this.notificationService.error('No se pudo editar el comentario');
      }
    });
  }

  get currentUserId() {
    const me = this.authService.getUserProfile();
    return me?.id || me?._id || null;
  }

  isCommentEdited(comment: any): boolean {
    if (!comment) return false;
    if (comment.edited) return true;
    const content = comment.content || '';
    return /\[editado\]\s*$/i.test(content);
  }

  isCommentOwner(comment: any): boolean {
    // Allow admins to manage comments
    try { if (this.authService.isAdmin && this.authService.isAdmin()) return true; } catch (e) {}

    const me = this.authService.getUserProfile();
    const myId = me?.id || me?._id || null;
    const myUserName = me?.nombreUsuario || me?.username || null;
    
    // Try ID comparison first
    const owner = comment?._ownerId || comment?.userId || comment?.user?._id || comment?.user || comment?.userIdStr || comment?.ownerId || comment?.authorId;
    if (myId && owner && String(owner) === String(myId)) return true;
    
    // Fallback: compare userName
    if (myUserName && comment?.userName) {
      return String(comment.userName) === String(myUserName);
    }
    
    return false;
  }

  cerrarPublicacionExpandida() {
    this.publicacionExpandida = null;
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    const container = img.parentElement;
    if (container) {
      const loader = container.querySelector('.imagen-loading') as HTMLElement;
      if (loader) {
        loader.style.display = 'none';
      }
      img.style.opacity = '1';
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const originalSrc = img.src;
    const retryCount = parseInt(img.getAttribute('data-retry') || '0');
    
    if (retryCount < 10) { // Máximo 10 reintentos (50 segundos)
      img.setAttribute('data-retry', (retryCount + 1).toString());
      setTimeout(() => {
        img.src = originalSrc + '?retry=' + Date.now();
      }, 5000);
    } else {
      const container = img.parentElement;
      if (container) {
        const loader = container.querySelector('.imagen-loading') as HTMLElement;
        if (loader) {
          loader.innerHTML = '<span style="color: #999;">Error al cargar imagen</span>';
        }
      }
      img.style.display = 'none';
    }
  }

  verImagenCompleta(imagenUrl: string) {
    // Crear modal para ver imagen completa
    const modal = document.createElement('div');
    modal.className = 'modal-imagen-completa';
    modal.innerHTML = `
      <div class="modal-backdrop" style="position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999; cursor: pointer;">
        <img src="${imagenUrl}" style="max-width: 90%; max-height: 90vh; object-fit: contain; border-radius: 8px;" alt="Imagen completa">
      </div>
    `;
    
    modal.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    document.body.appendChild(modal);
  }
}