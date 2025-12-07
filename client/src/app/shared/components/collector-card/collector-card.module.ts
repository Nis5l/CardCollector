import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { CollectorCardComponent } from './collector-card.component';
//TODO: move to shared
import { CollectorImageModule } from '../../../routes/collector';

const MATERIAL_MODULES = [
	MatCardModule,
  MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		CollectorImageModule,
	],
	declarations: [ CollectorCardComponent ],
	exports: [ CollectorCardComponent ],
})
export class CollectorCardModule {}
