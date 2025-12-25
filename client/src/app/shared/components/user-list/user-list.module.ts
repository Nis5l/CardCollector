import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { UserListComponent } from './user-list.component';
import { UserListService } from './user-list.service';
import { HttpModule } from '../../services';
import { NgVarModule } from '../../directives';
import { LoadingModule, UserCardModule } from '../../components';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatPaginatorModule,
	MatInputModule,
  MatPaginatorModule,
  MatSelectModule,
  MatIconModule,
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    ...MATERIAL_MODULES,

    UserCardModule,
    NgVarModule,
    HttpModule,
    LoadingModule,
  ],
  providers: [ UserListService ],
  declarations: [ UserListComponent ],
  exports: [ UserListComponent ],
})
export class UserListModule {}
