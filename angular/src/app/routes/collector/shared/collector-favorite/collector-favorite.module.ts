import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { CollectorFavoriteService } from './collector-favorite.service';
import { CollectorFavoriteComponent } from './collector-favorite.component';
import { HttpModule } from '../../../../shared/services';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
	MatTooltipModule
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		HttpModule
	],
	providers: [ CollectorFavoriteService ],
	declarations: [ CollectorFavoriteComponent ],
	exports: [ CollectorFavoriteComponent ],
})
export class CollectorFavoriteModule {}
