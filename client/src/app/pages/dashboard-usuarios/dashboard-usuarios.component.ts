import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from '../../services/usuarios.service';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-usuarios.component.html',
  styleUrl: './dashboard-usuarios.component.css'
})
export class DashboardUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  mostrarFormulario = false;
  cargando = false;

  nuevoUsuario = {
    nombre: '',
    apellido: '',
    email: '',
    nombreUsuario: '',
    password: '',
    fechaNacimiento: '',
    perfil: 'usuario' as 'usuario' | 'administrador'
  };

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuariosService.listarTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.cargando = false;
      }
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetFormulario();
    }
  }

  resetFormulario() {
    this.nuevoUsuario = {
      nombre: '',
      apellido: '',
      email: '',
      nombreUsuario: '',
      password: '',
      fechaNacimiento: '',
      perfil: 'usuario'
    };
  }

  crearUsuario() {
    if (!this.validarFormulario()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.cargando = true;
    this.usuariosService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        alert('Usuario creado exitosamente');
        this.resetFormulario();
        this.mostrarFormulario = false;
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error creando usuario:', error);
        alert(error.error?.message || 'Error al crear el usuario');
        this.cargando = false;
      }
    });
  }

  validarFormulario(): boolean {
    return !!(
      this.nuevoUsuario.nombre &&
      this.nuevoUsuario.apellido &&
      this.nuevoUsuario.email &&
      this.nuevoUsuario.nombreUsuario &&
      this.nuevoUsuario.password &&
      this.nuevoUsuario.fechaNacimiento
    );
  }

  habilitarUsuario(id: string) {
    if (confirm('¿Estás seguro de habilitar este usuario?')) {
      this.usuariosService.habilitarUsuario(id).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: (error) => {
          console.error('Error habilitando usuario:', error);
          alert('Error al habilitar el usuario');
        }
      });
    }
  }

  deshabilitarUsuario(id: string) {
    if (confirm('¿Estás seguro de deshabilitar este usuario? No podrá acceder a la aplicación.')) {
      this.usuariosService.deshabilitarUsuario(id).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: (error) => {
          console.error('Error deshabilitando usuario:', error);
          alert('Error al deshabilitar el usuario');
        }
      });
    }
  }

  getUsuarioId(usuario: Usuario): string {
    return usuario._id || usuario.id || '';
  }
}
