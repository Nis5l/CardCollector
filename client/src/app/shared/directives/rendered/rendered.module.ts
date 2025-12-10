import { NgModule } from '@angular/core';
import { RenderedDirective } from './rendered.directive';

@NgModule({
  declarations: [RenderedDirective],
  exports: [RenderedDirective],
})
export class RenderedModule {}
