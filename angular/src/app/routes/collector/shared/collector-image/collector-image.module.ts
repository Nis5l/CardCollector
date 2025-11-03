import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { CollectorImageComponent } from './collector-image.component';
import { CollectorImageService } from './collector-image.service';
import { HttpModule, AuthModule } from '../../../../shared/services';
import { ImageCircleModule } from '../../../../shared/components';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		HttpModule,
		AuthModule,
		ImageCircleModule
	],
	providers: [ CollectorImageService ],
	declarations: [ CollectorImageComponent ],
	exports: [ CollectorImageComponent ],
})
export class CollectorImageModule {}
