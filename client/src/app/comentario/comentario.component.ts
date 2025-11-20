import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../services/posts.service';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.component.html',
  styleUrls: ['./comentario.component.css'],
  standalone: true,
  imports: [DatePipe, FormsModule]
})
export class ComentarioComponent {
  @Input() data: any;
  @Input() postId?: string;

  // Edición inline
  editing = false;
  editContent = '';

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  isMyComment(): boolean {
    // Allow admin users to edit any comment
    try {
      if (this.authService.isAdmin && this.authService.isAdmin()) return true;
    } catch (e) {}

    const me = this.authService.getUserProfile();
    const myId = me?.id || me?._id || null;
    const myUserName = me?.nombreUsuario || me?.username || null;
    
    // Try ID comparison first
    const owner = this.data?._ownerId || this.data?.userId || this.data?.user?._id || this.data?.user || this.data?.userIdStr || this.data?.ownerId || this.data?.authorId;
    if (myId && owner && String(owner) === String(myId)) return true;
    
    // Fallback: compare userName if ID comparison failed
    if (myUserName && this.data?.userName) {
      return String(this.data.userName) === String(myUserName);
    }
    
    return false;
  }

  isCommentEdited(): boolean {
    if (!this.data) return false;
    if (this.data.edited) return true;
    const content = this.data.content || '';
    return /\[editado\]\s*$/i.test(content);
  }

  startEdit() {
    if (!this.isMyComment()) return;
    this.editing = true;
    this.editContent = (this.data?.content || '').replace(/\s*\[editado\]\s*$/i, '');
  }

  cancelEdit() {
    this.editing = false;
    this.editContent = '';
  }

  saveEdit() {
    const content = (this.editContent || '').trim();
    if (!content) {
      this.notificationService.error('El comentario no puede quedar vacío');
      return;
    }
    const pId = this.postId || this.data?.postId || this.data?.publicationId || this.data?.post?._id || this.data?.post?.id;
    const cId = this.data?._id || this.data?.id || this.data?.commentId;
    
    if (!pId || !cId) {
      console.error('postId o commentId faltan para editar');
      this.notificationService.error('No se puede editar este comentario (faltan IDs)');
      return;
    }

    this.postsService.editComment(pId, cId, content).subscribe({
      next: (resp) => {
        this.data.content = content + ' [editado]';
        this.data.edited = true;
        this.data.modified = true;
        this.data.modifiedAt = new Date();
        this.notificationService.success('Comentario editado');
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Error editando comentario:', err);
        this.notificationService.error('No se pudo editar el comentario');
      }
    });
  }
}
