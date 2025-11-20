import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pwa-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-demo.component.html',
  styleUrl: './pwa-demo.component.css'
})
export class PwaDemoComponent implements OnInit {
  isOnline = navigator.onLine;
  isPWA = false;
  isInstallable = false;
  hasUpdate = false;
  deferredPrompt: any = null;

  serviceWorkerStatus = 'Checking...';
  cacheStatus = 'Unknown';

  constructor(private swUpdate: SwUpdate) {
    // Detectar si se está ejecutando como PWA instalada
    this.isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone === true;
  }

  ngOnInit() {
    // Monitorear estado de conexión
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Detectar si la app es instalable
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.isInstallable = true;
    });

    // Verificar Service Worker
    this.checkServiceWorker();

    // Verificar actualizaciones disponibles
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.hasUpdate = true;
        });
    }
  }

  async checkServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          this.serviceWorkerStatus = 'Active ✓';
          this.checkCache();
        } else {
          this.serviceWorkerStatus = 'Not Registered ✗';
        }
      } catch (error) {
        this.serviceWorkerStatus = 'Error checking';
      }
    } else {
      this.serviceWorkerStatus = 'Not Supported ✗';
    }
  }

  async checkCache() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        this.cacheStatus = `${cacheNames.length} cache(s) active`;
      } catch (error) {
        this.cacheStatus = 'Error checking cache';
      }
    }
  }

  async installPWA() {
    if (!this.deferredPrompt) {
      alert('La aplicación no puede ser instalada en este momento');
      return;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      alert('¡Aplicación instalada con éxito!');
    }
    
    this.deferredPrompt = null;
    this.isInstallable = false;
  }

  reloadApp() {
    if (this.hasUpdate) {
      window.location.reload();
    }
  }

  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      alert('Cache limpiado. Recarga la página para volver a cachear.');
      this.checkCache();
    }
  }

  testOffline() {
    alert('Para probar el modo offline:\n\n1. Abre DevTools (F12)\n2. Ve a la pestaña "Network"\n3. Activa "Offline" en el dropdown\n4. Navega por la app\n\nLas páginas cacheadas seguirán funcionando!');
  }
}
