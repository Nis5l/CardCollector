import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { CollectorEditComponent } from './collector-edit.component';
import { CollectorService } from '../collector.service';
import { HttpModule, AuthModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import {
	CollectorImageModule,
	CollectorFavoriteModule,
	CollectorBannerModule,
	CollectorOpenModule
} from '../shared';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		RouterModule,

		...MATERIAL_MODULES,

		AuthModule,
		NgVarModule,
			
		CollectorImageModule,
		CollectorFavoriteModule,
		CollectorBannerModule,
		CollectorOpenModule,
	],
	providers: [ CollectorService ],
	declarations: [ CollectorEditComponent ],
})
export class CollectorEditModule {}
