import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { CollectorCatalogComponent } from './collector-catalog.component';
import { CardModule, LoadingModule } from '../../../../shared/components';
import { NgVarModule } from '../../../../shared/directives';

const MATERIAL_MODULES = [
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    ...MATERIAL_MODULES,

    CardModule,
    LoadingModule,
    NgVarModule
  ],
  declarations: [ CollectorCatalogComponent ],
})
export class CollectorCatalogModule {}
