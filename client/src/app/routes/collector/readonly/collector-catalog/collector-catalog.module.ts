import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectorCatalogComponent } from './collector-catalog.component';
import { CardListModule } from '../../../../shared/components';

@NgModule({
  imports: [
    CommonModule,

    CardListModule,
  ],
  declarations: [ CollectorCatalogComponent ],
})
export class CollectorCatalogModule {}
