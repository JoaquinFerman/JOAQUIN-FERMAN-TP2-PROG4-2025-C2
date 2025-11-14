import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { SessionService } from '../../services/session.service';
import { ErrorMessageComponent } from '../../components/error-message/error-message';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, ErrorMessageComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private sessionService: SessionService
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
    this.errorMsg = '';
    this.successMsg = '';
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res && res.access_token) {            
            this.authService.setToken(res.access_token);
            this.sessionService.iniciarContador(); // Iniciar contador de sesión
            this.successMsg = '¡Login exitoso!';
            setTimeout(() => {
              this.router.navigate(['/publicaciones']);
            }, 1000);
          } else {
            this.errorMsg = 'Respuesta inesperada del servidor.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err?.error?.message || 'Error al iniciar sesión.';
        }
      });
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
