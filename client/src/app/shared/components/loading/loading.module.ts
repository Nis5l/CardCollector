import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadingComponent } from './loading.component';
import { LoadingSpinnerModule } from '../loading-spinner';

@NgModule({
	imports: [
		CommonModule,

		LoadingSpinnerModule
	],
	declarations: [ LoadingComponent ],
	exports: [ LoadingComponent ]
})
export class LoadingModule {}
