import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

import { UsersComponent } from './users.component';
import { UsersService } from './users.service';
import { HttpModule } from '../../shared/services';
import { NgVarModule } from '../../shared/directives';
import { LoadingModule } from '../../shared/components';
import { UserModule } from './user';

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

    UserModule,
    NgVarModule,
    HttpModule,
    LoadingModule,
  ],
  providers: [ UsersService ],
  declarations: [ UsersComponent ]
})
export class UsersModule {}
