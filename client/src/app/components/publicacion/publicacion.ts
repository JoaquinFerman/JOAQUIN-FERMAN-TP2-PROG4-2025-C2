import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IPost } from '../../pages/publicaciones/publicaciones';

@Component({
  selector: 'app-publicacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css'
})
export class PublicacionComponent {
  @Input() post!: IPost;
  @Output() onLike = new EventEmitter<string>();
  @Output() onComment = new EventEmitter<{ postId: string, comment: string }>();

  newComment = '';
  showComments = false;

  toggleLike() {
    this.onLike.emit(this.post.id);
  }

  toggleComments() {
    this.showComments = !this.showComments;
  }

  addComment() {
    if (this.newComment.trim()) {
      this.onComment.emit({
        postId: this.post.id,
        comment: this.newComment
      });
      this.newComment = '';
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} min`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return `${days}d`;
    }
  }
}
