import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  
  if (!token) {
    console.log('No hay token, redirigiendo a login');
    router.navigate(['/login']);
    return false;
  }
  
  // Validar que el token no esté expirado
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    
    if (exp) {
      const now = Math.floor(Date.now() / 1000);
      if (now >= exp) {
        console.log('Token expirado, redirigiendo a login');
        authService.logout();
        router.navigate(['/login']);
        return false;
      }
    }
    
    console.log('Token válido, permitiendo acceso');
    return true;
  } catch (error) {
    console.error('Error al validar token:', error);
    authService.logout();
    router.navigate(['/login']);
    return false;
  }
};
