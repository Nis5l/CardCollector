import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { CollectorCardComponent } from './collector-card.component';
//TODO: move to shared
import { CollectorImageModule } from '../../../routes/collector';
import { RenderedModule } from '../../../shared/directives';

const MATERIAL_MODULES = [
	MatCardModule,
  MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

    RenderedModule,
		CollectorImageModule,
	],
	declarations: [ CollectorCardComponent ],
	exports: [ CollectorCardComponent ],
})
export class CollectorCardModule {}
