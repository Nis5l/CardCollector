import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';

import { CardListComponent } from './card-list.component';
import { NgVarModule } from '../../directives';
import { LoadingModule, CardModule } from '../../components';

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
  ],
  providers: [ ],
  declarations: [ CardListComponent ],
  exports: [ CardListComponent ],
})
export class CardListModule {}
