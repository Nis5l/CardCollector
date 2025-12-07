import { NgModule } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 

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
