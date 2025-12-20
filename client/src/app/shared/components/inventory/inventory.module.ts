import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { InventoryComponent } from './inventory.component';
import { InventoryService } from './inventory.service';
import { HttpModule } from '../../services';
import { CardModule, LoadingModule } from '../../components';
import { NgVarModule } from '../../directives';

const MATERIAL_MODULES = [
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatIconModule,
];

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,

    ...MATERIAL_MODULES,

    HttpModule,
    NgVarModule,
    CardModule,
    LoadingModule,
  ],
  providers: [ InventoryService ],
  declarations: [ InventoryComponent ],
  exports: [ InventoryComponent ],
})
export class InventoryModule {}
