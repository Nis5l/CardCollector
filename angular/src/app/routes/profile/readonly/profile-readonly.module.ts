import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
