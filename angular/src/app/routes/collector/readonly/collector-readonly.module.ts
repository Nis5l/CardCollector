import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

import { CollectorReadonlyComponent } from './collector-readonly.component';
import { CollectorReadonlyService } from './collector-readonly.service';
import { CollectorService } from '../collector.service';
import { HttpModule, AuthModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import {
	CollectorImageModule,
	CollectorFavoriteModule,
	CollectorBannerModule,
	CollectorOpenModule
} from '../shared';
//TODO: why??????
import { TabNavigationModule } from '../../../shared/components/tab-navigation';
import { CollectorAddDialogModule } from './collector-add-dialog';
import { CollectorDashboardModule } from './collector-dashboard';
import { CollectorRequestsModule } from './collector-requests';
import { CollectorInventoryModule } from './collector-inventory';

import { UserModule } from '../../../shared/components';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
	MatTabsModule,
	MatDialogModule,
	MatPaginatorModule,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,

		...MATERIAL_MODULES,

		HttpModule,
		AuthModule,
		NgVarModule,

		CollectorImageModule,
		CollectorFavoriteModule,
		CollectorBannerModule,
		CollectorOpenModule,
		CollectorAddDialogModule,
    CollectorDashboardModule,
    CollectorRequestsModule,
    TabNavigationModule,
    CollectorInventoryModule,

    UserModule,
	],
	providers: [ CollectorService, CollectorReadonlyService ],
	declarations: [ CollectorReadonlyComponent ],
})
export class CollectorReadonlyModule {}
