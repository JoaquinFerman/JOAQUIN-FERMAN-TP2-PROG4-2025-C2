import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoRelativo',
  standalone: true
})
export class TiempoRelativoPipe implements PipeTransform {
  transform(value: Date | string): string {
    if (!value) return '';

    const fecha = new Date(value);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const semanas = Math.floor(dias / 7);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);

    if (segundos < 60) {
      return 'hace un momento';
    } else if (minutos < 60) {
      return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    } else if (horas < 24) {
      return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    } else if (dias < 7) {
      return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    } else if (semanas < 4) {
      return `hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
    } else if (meses < 12) {
      return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      return `hace ${años} ${años === 1 ? 'año' : 'años'}`;
    }
  }
}
