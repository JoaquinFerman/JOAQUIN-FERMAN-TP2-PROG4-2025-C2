import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.html',
  styleUrl: './error-message.css'
})
export class ErrorMessageComponent {
  @Input() message: string = '';
}
