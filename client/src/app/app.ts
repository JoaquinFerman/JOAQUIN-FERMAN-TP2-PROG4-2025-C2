import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { SessionModalComponent } from './session-modal/session-modal.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SessionService } from './services/session.service';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, SessionModalComponent, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('client');
  showSessionModal = false;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to session warning modal
    this.sessionService.showWarningModal.subscribe((show) => {
      this.showSessionModal = show;
    });

    // Start session counter if user is logged in
    if (this.authService.isLoggedIn()) {
      this.sessionService.iniciarContador();
    }
  }

  onExtenderSesion() {
    const token = this.authService.getToken();
    if (token) {
      this.authService.refrescarToken(token).subscribe({
        next: (response) => {
          this.authService.setToken(response.access_token);
          this.sessionService.reiniciarContador();
          this.showSessionModal = false;
        },
        error: (error) => {
          console.error('Error al refrescar token:', error);
          this.authService.logout();
        }
      });
    }
  }

  onCerrarModal() {
    this.showSessionModal = false;
  }
}
