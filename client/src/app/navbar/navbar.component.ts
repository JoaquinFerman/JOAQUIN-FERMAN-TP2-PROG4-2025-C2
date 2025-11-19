import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuAbierto = false;
  dashboardAbierto = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleDashboard() {
    this.dashboardAbierto = !this.dashboardAbierto;
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserProfile() {
    return this.authService.getUserProfile();
  }
}
