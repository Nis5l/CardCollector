import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { NgVarModule } from '../../shared/directives';
import { PopupModule, HttpModule } from '../../shared/services';
import { NotificationItemComponent } from './notification-item';
import { NotificationsListComponent } from './notifications-list';
import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';

const MATERIAL_MODULES = [
	MatBadgeModule,
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,

		...MATERIAL_MODULES,
	
		HttpModule,
		NgVarModule,
		PopupModule
	],
	providers: [ NotificationsService ],
	declarations: [ NotificationsComponent, NotificationsListComponent, NotificationItemComponent ],
	exports: [ NotificationsComponent ],
})
export class NotificationsModule {}
