import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HttpModule, AuthModule } from '../../../shared/services';
import { ProfileImageModule, TabNavigationModule } from '../../../shared/components';
import { ConfirmationDialogModule } from '../../../shared/dialogs';
import { NgVarModule } from '../../../shared/directives';
import { ProfileReadonlyComponent } from './profile-readonly.component';
import { ProfileService } from '../profile.service';
import { CollectorFavoritesModule } from './collector-favorites';
import { CollectorFriendsModule } from './collector-friends';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
  MatDialogModule,
  MatTooltipModule,
];

@NgModule({
	imports: [
		CommonModule,
	 	RouterModule,

		...MATERIAL_MODULES,

    ConfirmationDialogModule,
		HttpModule,
		AuthModule,
		NgVarModule,
		ProfileImageModule,
    TabNavigationModule,
    CollectorFavoritesModule,
    CollectorFriendsModule,
	],
	declarations: [ ProfileReadonlyComponent ],
	providers: [ ProfileService ],
})
export class ProfileReadonlyModule {}
