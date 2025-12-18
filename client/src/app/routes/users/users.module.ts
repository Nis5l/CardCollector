import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UsersComponent } from './users.component';
import { UserListModule } from '../../shared/components';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    UserListModule,
  ],
  providers: [ ],
  declarations: [ UsersComponent ]
})
export class UsersModule {}
