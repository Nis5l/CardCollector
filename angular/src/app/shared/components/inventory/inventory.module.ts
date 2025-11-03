import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

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
