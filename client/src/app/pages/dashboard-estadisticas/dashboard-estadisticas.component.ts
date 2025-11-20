import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadisticasService } from '../../services/estadisticas.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-estadisticas.component.html',
  styleUrl: './dashboard-estadisticas.component.css'
})
export class DashboardEstadisticasComponent implements OnInit, AfterViewInit {
  fechaInicio: string = '';
  fechaFin: string = '';
  cargando = false;
  publicacionesTop10: any[] = [];
  comentariosTotalesData: any = null;
  comentariosPorPublicacionTop10: any[] = [];

  loadedPublicaciones = false;
  loadedComentariosTotales = false;
  loadedComentariosPorPublicacion = false;

  private chartPublicaciones?: Chart;
  private chartComentariosTotales?: Chart;
  private chartComentariosPorPublicacion?: Chart;

  constructor(private estadisticasService: EstadisticasService) {
    // Configurar fecha por defecto (último mes)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = haceUnMes.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarEstadisticas();
  }

  ngAfterViewInit() {
    // Los gráficos se crean después de cargar los datos
  }

  cargarEstadisticas() {
    this.cargando = true;
    this.cargarPublicacionesPorUsuario();
    this.cargarComentariosTotales();
    this.cargarComentariosPorPublicacion();
  }

  cargarPublicacionesPorUsuario() {
    this.estadisticasService.getPublicacionesPorUsuario(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.publicacionesTop10 = (data || []).slice(0,10);
        this.loadedPublicaciones = true;
        this.crearGraficoPublicaciones(this.publicacionesTop10);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando publicaciones por usuario:', error);
        this.loadedPublicaciones = true;
        this.cargando = false;
      }
    });
  }

  cargarComentariosTotales() {
    this.estadisticasService.getComentariosTotales(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.comentariosTotalesData = data;
        this.loadedComentariosTotales = true;
        this.crearGraficoComentariosTotales(data);
      },
      error: (error) => {
        console.error('Error cargando comentarios totales:', error);
        this.loadedComentariosTotales = true;
      }
    });
  }

  cargarComentariosPorPublicacion() {
    this.estadisticasService.getComentariosPorPublicacion(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.comentariosPorPublicacionTop10 = (data || []).slice(0,10);
        this.loadedComentariosPorPublicacion = true;
        this.crearGraficoComentariosPorPublicacion(this.comentariosPorPublicacionTop10);
      },
      error: (error) => {
        console.error('Error cargando comentarios por publicación:', error);
        this.loadedComentariosPorPublicacion = true;
      }
    });
  }

  get showNoDataBlock(): boolean {
    // true when all three have finished loading and all are empty/zero
    if (!this.loadedPublicaciones || !this.loadedComentariosTotales || !this.loadedComentariosPorPublicacion) return false;
    const publicacionesEmpty = !this.publicacionesTop10 || this.publicacionesTop10.length === 0;
    const comentariosTotalesEmpty = !this.comentariosTotalesData || this.comentariosTotalesData.total === 0;
    const comentariosPorPublicacionEmpty = !this.comentariosPorPublicacionTop10 || this.comentariosPorPublicacionTop10.length === 0;
    return publicacionesEmpty && comentariosTotalesEmpty && comentariosPorPublicacionEmpty;
  }

  private async waitForCanvas(id: string, retries = 10, delayMs = 50): Promise<HTMLCanvasElement | null> {
    for (let i = 0; i < retries; i++) {
      const el = document.getElementById(id) as HTMLCanvasElement | null;
      if (el && el.clientWidth > 0 && el.clientHeight > 0) return el;
      // element may exist but not yet measured; wait a bit
      await new Promise(res => setTimeout(res, delayMs));
    }
    return document.getElementById(id) as HTMLCanvasElement | null;
  }

  async crearGraficoPublicaciones(data: any[]) {
    if (this.chartPublicaciones) {
      this.chartPublicaciones.destroy();
    }

    console.log('crearGraficoPublicaciones - datos recibidos:', data);
    const top10 = (data || []).slice(0, 10);

    // Guardar para la plantilla: si está vacío mostramos un mensaje en lugar del canvas
    this.publicacionesTop10 = top10;

    if (!top10 || top10.length === 0) {
      console.warn('crearGraficoPublicaciones - No hay datos para mostrar en Publicaciones por Usuario');
      return;
    }

    // Ahora que la plantilla conoce que hay datos, esperamos a que el canvas exista en el DOM
    const canvas = await this.waitForCanvas('chartPublicaciones');
    if (!canvas) {
      console.warn('crearGraficoPublicaciones - canvas no encontrado tras reintentos');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('crearGraficoPublicaciones - no se obtuvo contexto 2d del canvas');
      return;
    }

    console.log('crearGraficoPublicaciones - canvas size', canvas.clientWidth, canvas.clientHeight);
    const labels = top10.map(item => item.userName || item.user || item.nombreUsuario || 'Usuario');
    const values = top10.map(item => item.cantidadPublicaciones ?? item.count ?? 0);

    this.chartPublicaciones = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad de Publicaciones',
          data: values,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Publicaciones por Usuario (Top 10)'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  async crearGraficoComentariosTotales(data: any) {
    if (this.chartComentariosTotales) {
      this.chartComentariosTotales.destroy();
    }

    const canvas = await this.waitForCanvas('chartComentariosTotales');
    if (!canvas) {
      console.warn('crearGraficoComentariosTotales - canvas no encontrado tras reintentos');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('crearGraficoComentariosTotales - no se obtuvo contexto 2d');
      return;
    }

    console.log('crearGraficoComentariosTotales - datos recibidos:', data);
    console.log('crearGraficoComentariosTotales - canvas size', canvas.clientWidth, canvas.clientHeight);

    this.chartComentariosTotales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.porFecha.map((item: any) => item.fecha),
        datasets: [{
          label: 'Comentarios por Día',
          data: data.porFecha.map((item: any) => item.cantidad),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: `Total de Comentarios: ${data.total}`
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  async crearGraficoComentariosPorPublicacion(data: any[]) {
    if (this.chartComentariosPorPublicacion) {
      this.chartComentariosPorPublicacion.destroy();
    }

    const canvas = await this.waitForCanvas('chartComentariosPorPublicacion');
    if (!canvas) {
      console.warn('crearGraficoComentariosPorPublicacion - canvas no encontrado tras reintentos');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('crearGraficoComentariosPorPublicacion - no se obtuvo contexto 2d');
      return;
    }

    const top10 = (data || []).slice(0, 10);
    if (!top10 || top10.length === 0) {
      console.warn('crearGraficoComentariosPorPublicacion - no hay datos');
      return;
    }

    console.log('crearGraficoComentariosPorPublicacion - canvas size', canvas.clientWidth, canvas.clientHeight);

    this.chartComentariosPorPublicacion = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: top10.map(item => `${item.userName || item.user || 'Usuario'}: ${item.content || item.title || ''}`),
        datasets: [{
          label: 'Comentarios',
          data: top10.map(item => item.cantidadComentarios ?? item.count ?? 0),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)',
            'rgba(99, 255, 132, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(255, 99, 255, 1)',
            'rgba(99, 255, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          title: {
            display: true,
            text: 'Comentarios por Publicación (Top 10)'
          }
        }
      }
    });
  }

  aplicarFiltro() {
    this.cargarEstadisticas();
  }

  ngOnDestroy() {
    if (this.chartPublicaciones) this.chartPublicaciones.destroy();
    if (this.chartComentariosTotales) this.chartComentariosTotales.destroy();
    if (this.chartComentariosPorPublicacion) this.chartComentariosPorPublicacion.destroy();
  }
}
