
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';
import { PaginaPublicaciones } from './pages/publicaciones';
import { LoadingComponent } from './loading/loading.component';
import { PublicacionDetalleComponent } from './pages/publicacion-detalle/publicacion-detalle.component';
import { DashboardUsuariosComponent } from './pages/dashboard-usuarios/dashboard-usuarios.component';
import { DashboardEstadisticasComponent } from './pages/dashboard-estadisticas/dashboard-estadisticas.component';
import { authGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

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
  {
    path: 'dashboard/usuarios',
    component: DashboardUsuariosComponent,
    canActivate: [authGuard, AdminGuard]
  },
  {
    path: 'dashboard/estadisticas',
    component: DashboardEstadisticasComponent,
    canActivate: [authGuard, AdminGuard]
  },
  { path: '**', redirectTo: '/login' }
];
