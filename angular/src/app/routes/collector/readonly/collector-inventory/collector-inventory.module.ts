import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CollectorInventoryComponent } from './collector-inventory.component';
//TODO: why?
import { InventoryModule } from '../../../../shared/components/inventory';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    InventoryModule,
  ],
  declarations: [ CollectorInventoryComponent ],
})
export class CollectorInventoryModule {}
