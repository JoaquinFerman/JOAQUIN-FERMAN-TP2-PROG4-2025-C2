import { Component, OnInit } from '@angular/core';
import { PublicacionComponent } from '../publicacion/publicacion.component';
import { MiPerfilComponent } from '../mi-perfil/mi-perfil.component';
import { PostsService } from '../services/posts.service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.css'],
  standalone: true,
  imports: [PublicacionComponent, MiPerfilComponent]
})
export class PublicacionesComponent implements OnInit {
  orden: 'fecha' | 'meGusta' = 'fecha';
  paginaActual = 1;
  publicaciones: any[] = [];
  totalPaginas = 1;
  publicacionesPorPagina = 5;
  usuario: any = null;
  mostrarPerfil = false;
  onCrearPublicacion(event: Event) {
    event.preventDefault();
    const input = (event.target as HTMLFormElement).elements.namedItem('content') as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      this.crearPublicacion(value);
      input.value = '';
    }
  }

  constructor(private postsService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.cargarUsuario();
    this.cargarPublicaciones();
  }

  cargarUsuario() {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token de autenticación');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT Payload en publicaciones:', payload);
      this.usuario = {
        id: payload.sub,
        nombre: payload.nombreUsuario,
        email: payload.email,
        username: payload.nombreUsuario,
        foto: payload.imagenPerfil || ''
      };
      console.log('Usuario cargado:', this.usuario);
    } catch (error) {
      console.error('Error al decodificar token:', error);
    }
  }

  cambiarOrden(orden: 'fecha' | 'meGusta') {
    this.orden = orden;
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    this.postsService.getAll().subscribe(posts => {
      let orderedPosts = [...posts];
      if (this.orden === 'fecha') {
        orderedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        orderedPosts.sort((a, b) => b.likesCount - a.likesCount);
      }
      this.totalPaginas = Math.ceil(orderedPosts.length / this.publicacionesPorPagina);
      const start = (this.paginaActual - 1) * this.publicacionesPorPagina;
      const end = start + this.publicacionesPorPagina;
      this.publicaciones = orderedPosts.slice(start, end);
    });
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarPublicaciones();
  }

  crearPublicacion(content: string) {
    if (!content.trim()) return;
    
    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token de autenticación para crear publicación');
      return;
    }
    
    console.log('Creando publicación con:', { content });
    
    // El servidor usa JwtAuthGuard y completa userId, userName, userPhoto desde el token
    // Solo enviamos el contenido
    const nueva = {
      content,
      date: new Date()
    };
    
    this.postsService.create(nueva).subscribe({
      next: () => {
        console.log('Publicación creada exitosamente');
        this.cargarPublicaciones();
      },
      error: (err) => {
        console.error('Error al crear publicación:', err);
      }
    });
  }
}
