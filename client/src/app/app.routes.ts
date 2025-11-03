
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';
import { PaginaPublicaciones } from './pages/publicaciones';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { 
    path: 'publicaciones', 
    component: PaginaPublicaciones,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
