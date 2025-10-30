import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicacionComponent } from '../../components/publicacion/publicacion';
import { ComentarioComponent } from '../../components/comentario/comentario';
import { Router } from '@angular/router';

export interface IPost {
  id: string;
  title: string;
  message: string;
  image?: string;
  author: {
    firstName: string;
    lastName: string;
    username: string;
    profileImage?: string;
  };
  createdAt: Date;
  likes: number;
  comments: IComment[];
  likedByUser?: boolean;
}

export interface IComment {
  id: string;
  message: string;
  author: {
    firstName: string;
    lastName: string;
    username: string;
    profileImage?: string;
  };
  createdAt: Date;
}

@Component({
  selector: 'app-posts',
  imports: [CommonModule, PublicacionComponent],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css'
})
export class PostsComponent implements OnInit {
  posts: IPost[] = [];
  loading = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    // Test data - in the future this will come from a service
    setTimeout(() => {
      this.posts = [
        {
          id: '1',
          title: 'Mi primera publicación',
          message: 'Hola a todos! Esta es mi primera publicación en la red social. ¡Espero que les guste!',
          image: 'https://picsum.photos/600/400?random=1',
          author: {
            firstName: 'Juan',
            lastName: 'Pérez',
            username: 'juanperez',
            profileImage: 'https://picsum.photos/100/100?random=100'
          },
          createdAt: new Date('2024-10-25'),
          likes: 12,
          likedByUser: false,
          comments: [
            {
              id: '1',
              message: '¡Excelente publicación!',
              author: {
                firstName: 'María',
                lastName: 'González',
                username: 'mariag',
                profileImage: 'https://picsum.photos/100/100?random=101'
              },
              createdAt: new Date('2024-10-25')
            },
            {
              id: '2',
              message: 'Me parece muy interesante',
              author: {
                firstName: 'Carlos',
                lastName: 'López',
                username: 'carlosl',
                profileImage: 'https://picsum.photos/100/100?random=102'
              },
              createdAt: new Date('2024-10-26')
            }
          ]
        },
        {
          id: '2',
          title: 'Día soleado',
          message: 'Aprovechando este hermoso día para salir a caminar por el parque. ¡La naturaleza siempre inspira!',
          image: 'https://picsum.photos/600/400?random=2',
          author: {
            firstName: 'Ana',
            lastName: 'Martín',
            username: 'anamartin',
            profileImage: 'https://picsum.photos/100/100?random=103'
          },
          createdAt: new Date('2024-10-26'),
          likes: 25,
          likedByUser: true,
          comments: [
            {
              id: '3',
              message: '¡Qué hermosa foto!',
              author: {
                firstName: 'Luis',
                lastName: 'Rodríguez',
                username: 'luisr',
                profileImage: 'https://picsum.photos/100/100?random=104'
              },
              createdAt: new Date('2024-10-26')
            }
          ]
        },
        {
          id: '3',
          title: 'Reflexión del día',
          message: 'Cada día es una nueva oportunidad para aprender algo nuevo y crecer como persona. ¡Nunca dejen de soñar!',
          author: {
            firstName: 'Pedro',
            lastName: 'Sánchez',
            username: 'pedros',
            profileImage: 'https://picsum.photos/100/100?random=105'
          },
          createdAt: new Date('2024-10-27'),
          likes: 8,
          likedByUser: false,
          comments: []
        }
      ];
      this.loading = false;
    }, 1500);
  }

  onLikePost(postId: string) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      if (post.likedByUser) {
        post.likes--;
        post.likedByUser = false;
      } else {
        post.likes++;
        post.likedByUser = true;
      }
    }
  }

  onCommentPost(data: { postId: string, comment: string }) {
    const post = this.posts.find(p => p.id === data.postId);
    if (post && data.comment.trim()) {
      const newComment: IComment = {
        id: Math.random().toString(36).substr(2, 9),
        message: data.comment,
        author: {
          firstName: 'Usuario',
          lastName: 'Actual',
          username: 'usuario_actual',
          profileImage: 'https://picsum.photos/100/100?random=200'
        },
        createdAt: new Date()
      };
      post.comments.push(newComment);
    }
  }

  navigateToProfile() {
    this.router.navigate(['/perfil']);
  }
}
