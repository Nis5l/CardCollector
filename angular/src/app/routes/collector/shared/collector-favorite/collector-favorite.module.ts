import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

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
