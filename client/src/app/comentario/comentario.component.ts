import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.component.html',
  styleUrls: ['./comentario.component.css'],
  standalone: true,
  imports: [DatePipe]
})
export class ComentarioComponent {
  @Input() data: any;
}
