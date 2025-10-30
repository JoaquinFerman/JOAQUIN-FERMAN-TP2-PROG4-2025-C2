import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {
  registroForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, this.ageValidator]],
      descripcion: ['', [Validators.maxLength(500)]],
      imagenPerfil: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) return null;
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasMinLength = value.length >= 8;
    
    const valid = hasUpperCase && hasNumber && hasMinLength;
    return valid ? null : { invalidPassword: true };
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ageValidator(control: AbstractControl) {
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      return actualAge < 13 ? { underAge: true } : null;
    }
    
    return age < 13 ? { underAge: true } : null;
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
    if (this.registroForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      
      Object.keys(this.registroForm.value).forEach(key => {
        if (key !== 'confirmPassword') {
          formData.append(key, this.registroForm.value[key]);
        }
      });

      if (this.selectedFile) {
        formData.append('imagenPerfil', this.selectedFile);
      }

      console.log('Datos del registro:', this.registroForm.value);
      setTimeout(() => {
        this.isLoading = false;
        alert('Usuario registrado exitosamente');
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registroForm.controls).forEach(key => {
      const control = this.registroForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(field: string): string {
    const control = this.registroForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${this.getFieldName(field)} es requerido`;
      if (control.errors['minlength']) return `${this.getFieldName(field)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `${this.getFieldName(field)} no puede tener más de ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['invalidPassword']) return 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
      if (control.errors['underAge']) return 'Debes ser mayor de 13 años para registrarte';
    }

    // Validar password mismatch a nivel de formulario
    if (field === 'confirmPassword' && this.registroForm.errors?.['passwordMismatch'] && control?.touched) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }

  private getFieldName(field: string): string {
    const names: { [key: string]: string } = {
      'nombre': 'Nombre',
      'apellido': 'Apellido',
      'email': 'Email',
      'nombreUsuario': 'Nombre de usuario',
      'password': 'Contraseña',
      'confirmPassword': 'Confirmar contraseña',
      'fechaNacimiento': 'Fecha de nacimiento',
      'descripcion': 'Descripción'
    };
    return names[field] || field;
  }
}
