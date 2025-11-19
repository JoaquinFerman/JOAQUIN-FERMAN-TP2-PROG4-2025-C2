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
        this.crearGraficoPublicaciones(data);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando publicaciones por usuario:', error);
        this.cargando = false;
      }
    });
  }

  cargarComentariosTotales() {
    this.estadisticasService.getComentariosTotales(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.crearGraficoComentariosTotales(data);
      },
      error: (error) => {
        console.error('Error cargando comentarios totales:', error);
      }
    });
  }

  cargarComentariosPorPublicacion() {
    this.estadisticasService.getComentariosPorPublicacion(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.crearGraficoComentariosPorPublicacion(data);
      },
      error: (error) => {
        console.error('Error cargando comentarios por publicación:', error);
      }
    });
  }

  crearGraficoPublicaciones(data: any[]) {
    if (this.chartPublicaciones) {
      this.chartPublicaciones.destroy();
    }

    const canvas = document.getElementById('chartPublicaciones') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const top10 = data.slice(0, 10);

    this.chartPublicaciones = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top10.map(item => item.userName),
        datasets: [{
          label: 'Cantidad de Publicaciones',
          data: top10.map(item => item.cantidadPublicaciones),
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

  crearGraficoComentariosTotales(data: any) {
    if (this.chartComentariosTotales) {
      this.chartComentariosTotales.destroy();
    }

    const canvas = document.getElementById('chartComentariosTotales') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

  crearGraficoComentariosPorPublicacion(data: any[]) {
    if (this.chartComentariosPorPublicacion) {
      this.chartComentariosPorPublicacion.destroy();
    }

    const canvas = document.getElementById('chartComentariosPorPublicacion') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const top10 = data.slice(0, 10);

    this.chartComentariosPorPublicacion = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: top10.map(item => `${item.userName}: ${item.content}`),
        datasets: [{
          label: 'Comentarios',
          data: top10.map(item => item.cantidadComentarios),
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
