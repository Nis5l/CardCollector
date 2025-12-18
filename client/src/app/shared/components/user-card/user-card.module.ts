import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

import { UserCardComponent } from './user-card.component';
import { ProfileImageModule } from '../profile-image';

const MATERIAL_MODULES = [
	MatCardModule
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

		...MATERIAL_MODULES,

    ProfileImageModule,
  ],
  declarations: [ UserCardComponent ],
  exports: [ UserCardComponent ],
})
export class UserCardModule {}
