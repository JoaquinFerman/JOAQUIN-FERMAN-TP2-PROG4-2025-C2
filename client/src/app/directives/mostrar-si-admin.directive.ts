import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';

@Directive({
  selector: '[appMostrarSiAdmin]',
  standalone: true
})
export class MostrarSiAdminDirective implements OnInit {
  constructor(
    private el: ElementRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.authService.isAdmin()) {
      this.el.nativeElement.style.display = 'none';
    }
  }
}
