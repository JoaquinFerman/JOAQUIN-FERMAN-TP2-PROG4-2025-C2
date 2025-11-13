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
    const form = event.target as HTMLFormElement;
    const contentInput = form.elements.namedItem('content') as HTMLTextAreaElement;
    const imageInput = form.elements.namedItem('image') as HTMLInputElement;
    const content = contentInput.value.trim();
    const imageFiles = imageInput && imageInput.files ? Array.from(imageInput.files) : [];
    if (content) {
      this.crearPublicacion(content, imageFiles);
      contentInput.value = '';
      if (imageInput) imageInput.value = '';
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
    // Use server-side pagination when possible
    const offset = (this.paginaActual - 1) * this.publicacionesPorPagina;
    const limit = this.publicacionesPorPagina;
    this.postsService.getAllPaginated({ order: this.orden, offset, limit }).subscribe(res => {
      // Server returns either { total, posts } when paginated or an array (legacy)
      if (res && res.posts) {
        this.publicaciones = res.posts;
        this.totalPaginas = Math.ceil(res.total / this.publicacionesPorPagina) || 1;
      } else if (Array.isArray(res)) {
        let orderedPosts = [...res];
        if (this.orden === 'fecha') {
          orderedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
          orderedPosts.sort((a, b) => b.likesCount - a.likesCount);
        }
        this.totalPaginas = Math.ceil(orderedPosts.length / this.publicacionesPorPagina);
        const start = (this.paginaActual - 1) * this.publicacionesPorPagina;
        const end = start + this.publicacionesPorPagina;
        this.publicaciones = orderedPosts.slice(start, end);
      } else {
        // fallback
        this.publicaciones = res || [];
        this.totalPaginas = 1;
      }
    });
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarPublicaciones();
  }

  crearPublicacion(content: string, imagenes: File[] = []) {
    if (!content.trim()) return;

    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token de autenticación para crear publicación');
      return;
    }

    // Enviar como objeto JSON, no FormData
    const publicacionData = { content: content.trim() };

    this.postsService.create(publicacionData).subscribe({
      next: (publicacion) => {
        console.log('Publicación creada exitosamente', publicacion);
        // Subir imágenes una por una con convención <idPublicacion>:<idImagen>
        if (publicacion && publicacion._id && imagenes.length > 0) {
          imagenes.forEach((file, idx) => {
            const imageForm = new FormData();
            imageForm.append('file', file);
            // El endpoint debe aceptar la imagen y guardarla como <idPublicacion>:<idImagen>
            this.postsService.uploadImage(publicacion._id, imageForm, idx + 1).subscribe({
              next: (res) => {
                console.log('Imagen subida:', res);
              },
              error: (err) => {
                console.error('Error al subir imagen:', err);
              }
            });
          });
        }
        this.cargarPublicaciones();
      },
      error: (err) => {
        console.error('Error al crear publicación:', err);
      }
    });
  }
}
