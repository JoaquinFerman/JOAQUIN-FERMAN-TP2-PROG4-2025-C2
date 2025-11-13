
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';
import { PaginaPublicaciones } from './pages/publicaciones';
import { LoadingComponent } from './loading/loading.component';
import { PublicacionDetalleComponent } from './pages/publicacion-detalle/publicacion-detalle.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LoadingComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { 
    path: 'publicaciones', 
    component: PaginaPublicaciones,
    canActivate: [authGuard]
  },
  {
    path: 'publicaciones/:id',
    component: PublicacionDetalleComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
