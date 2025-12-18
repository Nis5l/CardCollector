import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { CollectorFriendCardComponent } from './collector-friend-card.component';
import { NgVarModule } from '../../../../../shared/directives';
import { UserCardModule } from '../../../../../shared/components';

const MATERIAL_MODULES = [
  MatIconModule,
  MatButtonModule,
];

@NgModule({
  imports: [
    CommonModule,

    ...MATERIAL_MODULES,

    NgVarModule,
    UserCardModule,
  ],
  declarations: [ CollectorFriendCardComponent ],
  exports: [ CollectorFriendCardComponent ]
})
export class CollectorFriendCardModule {}
