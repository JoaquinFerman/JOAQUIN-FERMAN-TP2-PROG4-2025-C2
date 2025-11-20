import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from '../../services/usuarios.service';
import { firstValueFrom } from 'rxjs';

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
  // Confirm modal state
  showConfirmModal = false;
  confirmAction: 'deshabilitar' | 'habilitar' | '' = '';
  confirmTarget: Usuario | null = null;
  confirmLoading = false;

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
    // Open confirmation modal for enabling
    const usuario = this.usuarios.find(u => this.getUsuarioId(u) === id) || null;
    this.openConfirm('habilitar', usuario);
  }

  deshabilitarUsuario(id: string) {
    // Open confirmation modal for disabling
    const usuario = this.usuarios.find(u => this.getUsuarioId(u) === id) || null;
    this.openConfirm('deshabilitar', usuario);
  }

  openConfirm(action: 'deshabilitar' | 'habilitar', usuario: Usuario | null) {
    this.confirmAction = action;
    this.confirmTarget = usuario;
    this.showConfirmModal = true;
  }

  async confirmModal() {
    if (!this.confirmAction || !this.confirmTarget) return;
    this.confirmLoading = true;
    const id = this.getUsuarioId(this.confirmTarget);
    try {
      if (this.confirmAction === 'deshabilitar') {
        await firstValueFrom(this.usuariosService.deshabilitarUsuario(id));
      } else {
        await firstValueFrom(this.usuariosService.habilitarUsuario(id));
      }
      this.cargarUsuarios();
    } catch (error) {
      console.error(`Error en ${this.confirmAction} usuario:`, error);
      alert('Error al ejecutar la acción en el usuario');
    } finally {
      this.confirmLoading = false;
      this.showConfirmModal = false;
      this.confirmAction = '';
      this.confirmTarget = null;
    }
  }

  cancelModal() {
    this.showConfirmModal = false;
    this.confirmAction = '';
    this.confirmTarget = null;
  }

  getUsuarioId(usuario: Usuario): string {
    return usuario._id || usuario.id || '';
  }
}
