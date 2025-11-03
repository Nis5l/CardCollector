import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { CollectorFriendCardComponent } from './collector-friend-card.component';
import { ProfileImageModule } from 'src/app/shared/components';
import { NgVarModule } from '../../../../../shared/directives';

const MATERIAL_MODULES = [
	MatCardModule,
  MatIconModule,
  MatButtonModule,
];

@NgModule({
  imports: [
    CommonModule,

    ...MATERIAL_MODULES,

    NgVarModule,
    ProfileImageModule,
  ],
  declarations: [ CollectorFriendCardComponent ],
  exports: [ CollectorFriendCardComponent ]
})
export class CollectorFriendCardModule {}
