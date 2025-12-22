import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';

import { CollectorReadonlyComponent } from './collector-readonly.component';
import { CollectorServiceModule } from '../shared';
import { HttpModule, AuthModule } from '../../../shared/services';
import { NgVarModule, RenderedModule } from '../../../shared/directives';
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
import { CollectorCatalogModule } from './collector-catalog';

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
    RenderedModule,
    CollectorServiceModule,
    UserModule,

		CollectorImageModule,
		CollectorFavoriteModule,
		CollectorBannerModule,
		CollectorOpenModule,
		CollectorAddDialogModule,
    CollectorDashboardModule,
    CollectorRequestsModule,
    TabNavigationModule,
    CollectorInventoryModule,
    CollectorCatalogModule,
	],
	providers: [ ],
	declarations: [ CollectorReadonlyComponent ],
})
export class CollectorReadonlyModule {}
