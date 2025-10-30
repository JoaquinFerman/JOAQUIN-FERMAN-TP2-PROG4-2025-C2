import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IComment } from '../../pages/publicaciones/publicaciones';

@Component({
  selector: 'app-comentario',
  imports: [CommonModule],
  templateUrl: './comentario.html',
  styleUrl: './comentario.css'
})
export class ComentarioComponent {
  @Input() comentario!: IComment;

  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 60) {
      return `${minutos} min`;
    } else if (horas < 24) {
      return `${horas}h`;
    } else {
      return `${dias}d`;
    }
  }
}
