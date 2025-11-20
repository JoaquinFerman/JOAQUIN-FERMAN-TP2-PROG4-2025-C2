import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { log } from 'console';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('request' + request)
    const user = request.user;
    console.log('user' + request)

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (user.perfil !== 'administrador') {
      throw new ForbiddenException('Acceso denegado. Se requiere perfil de administrador');
    }

    return true;
  }
}
