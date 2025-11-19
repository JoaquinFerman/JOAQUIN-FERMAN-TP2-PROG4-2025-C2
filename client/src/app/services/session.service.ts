import { Injectable } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private sessionTimer: Subscription | null = null;
  private warningShown = false;
  public showWarningModal = new Subject<boolean>();
  
  constructor(private authService: AuthService) {}

  iniciarContador() {
    this.detenerContador();
    this.warningShown = false;
    
    // Contador - mostrar advertencia a los 12 minutos, cerrar a los 15
    const timerSubscription = interval(1000).subscribe((secondsElapsed) => {
      const minutesElapsed = Math.floor(secondsElapsed / 60);
      
      // A los 12 minutos (3 minutos antes de expirar), mostrar el modal de advertencia
      if (minutesElapsed >= 12 && !this.warningShown) {
        this.warningShown = true;
        this.showWarningModal.next(true);
      }
      
      // A los 15 minutos, cerrar sesión automáticamente
      if (minutesElapsed >= 15) {
        this.detenerContador();
        this.authService.logout();
        window.location.href = '/login';
      }
    });
    
    this.sessionTimer = timerSubscription;
  }

  detenerContador() {
    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
      this.sessionTimer = null;
    }
  }

  reiniciarContador() {
    this.iniciarContador();
  }

  extenderSesion() {
    const token = this.authService.getToken();
    if (token) {
      this.authService.refrescarToken(token).subscribe({
        next: (response) => {
          this.authService.setToken(response.access_token);
          this.iniciarContador(); // Reiniciar el contador
          this.showWarningModal.next(false);
        },
        error: () => {
          this.authService.logout();
          window.location.href = '/login';
        }
      });
    }
  }

  rechazarExtension() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
