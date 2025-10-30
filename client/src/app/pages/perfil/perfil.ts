import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  birthDate: string;
  description: string;
  profileImage?: string;
  registrationDate: Date;
  role: 'user' | 'admin';
}

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent implements OnInit {
  user: IUser | null = null;
  profileForm: FormGroup;
  editing = false;
  loading = true;
  saving = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      birthDate: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    // Test data - in future this will come from a service
    setTimeout(() => {
      this.user = {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        username: 'juanperez',
        birthDate: '1995-06-15',
        description: 'Desarrollador apasionado por la tecnología y la programación. Me encanta crear aplicaciones web.',
        profileImage: 'https://picsum.photos/200/200?random=100',
        registrationDate: new Date('2024-01-15'),
        role: 'user'
      };
      // Populate form with user data
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        username: this.user.username,
        birthDate: this.user.birthDate,
        description: this.user.description
      });
      this.imagePreview = this.user.profileImage || null;
      this.loading = false;
    }, 1000);
  }

  toggleEdit() {
    this.editing = !this.editing;
    if (!this.editing && this.user) {
      // Reset form to original values
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        username: this.user.username,
        birthDate: this.user.birthDate,
        description: this.user.description
      });
      this.selectedFile = null;
      this.imagePreview = this.user.profileImage || null;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.type)) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor selecciona una imagen válida (JPG, PNG, GIF)');
        event.target.value = '';
      }
    }
  }

  onSubmit() {
    if (this.profileForm.valid && this.user) {
      this.saving = true;
      const formData = new FormData();
      // Add form fields
      Object.keys(this.profileForm.value).forEach(key => {
        formData.append(key, this.profileForm.value[key]);
      });
      // Add image if selected
      if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
      }
      console.log('Updating profile:', this.profileForm.value);
      // Simulate API call
      setTimeout(() => {
        // Update local user data
        Object.assign(this.user!, this.profileForm.value);
        if (this.selectedFile) {
          this.user!.profileImage = this.imagePreview!;
        }
        this.saving = false;
        this.editing = false;
        this.selectedFile = null;
        alert('Perfil actualizado exitosamente');
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(field: string): string {
    const control = this.profileForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${this.getFieldName(field)} es requerido`;
      if (control.errors['minlength']) return `${this.getFieldName(field)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `${this.getFieldName(field)} no puede tener más de ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Email inválido';
    }
    return '';
  }

  private getFieldName(field: string): string {
    const names: { [key: string]: string } = {
      'firstName': 'Nombre',
      'lastName': 'Apellido',
      'email': 'Email',
      'username': 'Nombre de usuario',
      'birthDate': 'Fecha de nacimiento',
      'description': 'Descripción'
    };
    return names[field] || field;
  }

  navigateToPublicaciones() {
    this.router.navigate(['/publicaciones']);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
