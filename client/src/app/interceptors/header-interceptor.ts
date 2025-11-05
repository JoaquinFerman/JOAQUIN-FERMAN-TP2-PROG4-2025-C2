import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    let authReq = req;
    if (token) {
      // Log token presence for debugging (will appear in browser console)
      try {
        // Don't print full token in production; this is for local debugging only
        console.debug('HeaderInterceptor - attaching token (first 10 chars):', token?.slice(0, 10) + '...');
      } catch (e) {
        // ignore
      }
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.debug('HeaderInterceptor - no token found in AuthService');
    }
    return next.handle(authReq);
  }
}
