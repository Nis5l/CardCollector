import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadingService } from './loading.service';
import { LoadingComponent } from './loading.component';
import { LoadingSpinnerModule } from '../../components/loading-spinner';

@NgModule({
	imports: [
		CommonModule,

		LoadingSpinnerModule,
	],
	providers: [ LoadingService ],
	declarations: [ LoadingComponent ],
	exports: [ LoadingComponent ],
})
export class LoadingModule {}
