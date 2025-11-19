import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncar',
  standalone: true
})
export class TruncarPipe implements PipeTransform {
  transform(value: string, limite: number = 50, sufijo: string = '...'): string {
    if (!value) return '';
    if (value.length <= limite) return value;
    return value.substring(0, limite).trim() + sufijo;
  }
}
