import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { CollectorCatalogComponent } from './collector-catalog.component';
import { CardModule, LoadingModule } from '../../../../shared/components';
import { CardServiceModule } from '../../../../shared/services';
import { NgVarModule } from '../../../../shared/directives';

const MATERIAL_MODULES = [
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatIconModule,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    ...MATERIAL_MODULES,

    CardModule,
    LoadingModule,
    NgVarModule,
    CardServiceModule,
  ],
  declarations: [ CollectorCatalogComponent ],
})
export class CollectorCatalogModule {}
