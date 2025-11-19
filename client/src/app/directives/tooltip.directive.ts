import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input() appTooltip: string = '';
  private tooltipElement?: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltipElement && this.appTooltip) {
      this.mostrarTooltip();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltipElement) {
      this.ocultarTooltip();
    }
  }

  private mostrarTooltip() {
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.appendChild(
      this.tooltipElement,
      this.renderer.createText(this.appTooltip)
    );

    this.renderer.addClass(this.tooltipElement, 'custom-tooltip');
    
    // Estilos del tooltip
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'background-color', '#333');
    this.renderer.setStyle(this.tooltipElement, 'color', '#fff');
    this.renderer.setStyle(this.tooltipElement, 'padding', '8px 12px');
    this.renderer.setStyle(this.tooltipElement, 'border-radius', '6px');
    this.renderer.setStyle(this.tooltipElement, 'font-size', '14px');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipElement, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = {
      top: hostPos.bottom + window.scrollY + 5,
      left: hostPos.left + window.scrollX + (hostPos.width / 2)
    };

    this.renderer.setStyle(this.tooltipElement, 'top', `${tooltipPos.top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${tooltipPos.left}px`);
    this.renderer.setStyle(this.tooltipElement, 'transform', 'translateX(-50%)');

    this.renderer.appendChild(document.body, this.tooltipElement);
  }

  private ocultarTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = undefined;
    }
  }
}
