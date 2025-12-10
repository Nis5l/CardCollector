import { Directive, ElementRef, EventEmitter, AfterViewInit, Output } from '@angular/core';

@Directive({
  selector: '[ccRendered]',
  standalone: false
})
export class RenderedDirective implements AfterViewInit {
  @Output() rendered = new EventEmitter<HTMLElement>();

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.rendered.emit(this.el.nativeElement);

    const ro = new ResizeObserver(() => {
      this.rendered.emit(this.el.nativeElement);
    });
    ro.observe(this.el.nativeElement);
  }
}
