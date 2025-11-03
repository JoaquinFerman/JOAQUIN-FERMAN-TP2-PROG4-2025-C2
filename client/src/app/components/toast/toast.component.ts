import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (notification of notifications; track notification.id) {
        <div class="toast toast-{{notification.type}}">
          <div class="toast-icon">
            @switch (notification.type) {
              @case ('success') { <span>✓</span> }
              @case ('error') { <span>✕</span> }
              @case ('info') { <span>ℹ</span> }
              @case ('warning') { <span>⚠</span> }
            }
          </div>
          <div class="toast-message">{{ notification.message }}</div>
          <button class="toast-close" (click)="removeNotification(notification.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      animation: slideInRight 0.3s ease-out;
      min-width: 300px;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      border-left-color: #43a047;
    }

    .toast-error {
      border-left-color: #e53935;
    }

    .toast-info {
      border-left-color: #1e88e5;
    }

    .toast-warning {
      border-left-color: #ffa726;
    }

    .toast-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      flex-shrink: 0;
    }

    .toast-success .toast-icon {
      background: #e8f5e9;
      color: #43a047;
    }

    .toast-error .toast-icon {
      background: #ffebee;
      color: #e53935;
    }

    .toast-info .toast-icon {
      background: #e3f2fd;
      color: #1e88e5;
    }

    .toast-warning .toast-icon {
      background: #fff3e0;
      color: #ffa726;
    }

    .toast-message {
      flex: 1;
      color: #333;
      font-weight: 500;
      font-size: 14px;
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #999;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    @media (max-width: 768px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .toast {
        min-width: auto;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(
      (notification) => {
        this.notifications.push(notification);
        
        // Auto remove after duration
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, notification.duration || 4000);
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
}
