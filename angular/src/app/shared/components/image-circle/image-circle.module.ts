import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { ImageCircleComponent } from './image-circle.component';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,
	],
	declarations: [ ImageCircleComponent ],
	exports: [ ImageCircleComponent ],
})
export class ImageCircleModule {}
