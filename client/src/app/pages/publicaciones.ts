
import { Component } from '@angular/core';
import { PublicacionesComponent } from '../publicaciones/publicaciones.component';
import { MiPerfilComponent } from '../mi-perfil/mi-perfil.component';

@Component({
  selector: 'app-pagina-publicaciones',
  standalone: true,
  imports: [PublicacionesComponent, MiPerfilComponent],
  templateUrl: './publicaciones.html'
})
export class PaginaPublicaciones {}
