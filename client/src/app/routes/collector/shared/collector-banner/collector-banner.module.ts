import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HttpModule } from '../../../../shared/services';
import { CollectorBannerComponent } from './collector-banner.component';
import { CollectorBannerService } from './collector-banner.service';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		HttpModule
	],
	providers: [ CollectorBannerService ],
	declarations: [ CollectorBannerComponent ],
	exports: [ CollectorBannerComponent ],
})
export class CollectorBannerModule {}
