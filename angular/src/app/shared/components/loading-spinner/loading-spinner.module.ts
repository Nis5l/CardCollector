import { NgModule } from '@angular/core';

import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'; 

import { LoadingSpinnerComponent } from './loading-spinner.component';

const MATERIAL_MODULES = [
	MatProgressSpinnerModule,
];

@NgModule({
	imports: [ ...MATERIAL_MODULES ],
	declarations: [ LoadingSpinnerComponent ],
	exports: [ LoadingSpinnerComponent ],
})
export class LoadingSpinnerModule {}
