import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { UsersComponent } from './users.component';
import { UsersService } from './users.service';
import { HttpModule } from '../../shared/services';
import { NgVarModule } from '../../shared/directives';
import { LoadingModule, UserCardModule } from '../../shared/components';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatPaginatorModule,
	MatInputModule,
  MatPaginatorModule,
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
  providers: [ UsersService ],
  declarations: [ UsersComponent ]
})
export class UsersModule {}
