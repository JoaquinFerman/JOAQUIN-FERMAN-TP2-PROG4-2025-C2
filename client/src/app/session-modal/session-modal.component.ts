import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>⚠️ Sesión por expirar</h2>
        <p>Tu sesión expirará en 5 minutos.</p>
        <p>¿Deseas extender tu sesión?</p>
        <div class="modal-buttons">
          <button class="btn-primary" (click)="onExtender()">Sí, extender sesión</button>
          <button class="btn-secondary" (click)="onCerrar()">No, cerrar sesión</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }
    
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      text-align: center;
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    h2 {
      color: #667eea;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    
    p {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }
    
    .modal-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      justify-content: center;
    }
    
    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .btn-secondary {
      background: #e1e5e9;
      color: #666;
    }
    
    .btn-secondary:hover {
      background: #d1d5d9;
    }
  `]
})
export class SessionModalComponent {
  @Output() extender = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  onExtender() {
    this.extender.emit();
  }

  onCerrar() {
    this.cerrar.emit();
  }
}
