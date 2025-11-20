import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { log } from 'console';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.perfil) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (request.perfil !== 'administrador') {
      throw new ForbiddenException('Acceso denegado. Se requiere perfil de administrador');
    }

    return true;
  }
}
