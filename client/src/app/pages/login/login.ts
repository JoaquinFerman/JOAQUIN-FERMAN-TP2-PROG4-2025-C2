import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      emailOrUsername: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]]
    });
  }

  passwordValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasMinLength = value.length >= 8;
    
    const valid = hasUpperCase && hasNumber && hasMinLength;
    return valid ? null : { invalidPassword: true };
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      console.log('Datos del login:', this.loginForm.value);
      // TODO: Conectar con el servicio de autenticación
      setTimeout(() => {
        this.isLoading = false;
        // Redirect to publications after successful login
        this.router.navigate(['/publicaciones']);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${this.getFieldName(field)} es requerido`;
      if (control.errors['minlength']) return `${this.getFieldName(field)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['invalidPassword']) return 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
    }
    return '';
  }

  private getFieldName(field: string): string {
    const names: { [key: string]: string } = {
      'emailOrUsername': 'Email o nombre de usuario',
      'password': 'Contraseña'
    };
    return names[field] || field;
  }
}
