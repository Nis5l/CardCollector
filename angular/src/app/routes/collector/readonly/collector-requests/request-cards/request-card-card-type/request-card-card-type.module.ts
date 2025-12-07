import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestCardCardTypeComponent } from './request-card-card-type.component';
import { RequestCardCardTypeService } from './request-card-card-type.service';
import { RequestCardModule } from '../shared';
import { HttpModule } from '../../../../../../shared/services';

@NgModule({
	imports: [
		CommonModule,

		HttpModule,

		RequestCardModule,
	],
	providers: [ RequestCardCardTypeService ],
	declarations: [ RequestCardCardTypeComponent ],
	exports: [ RequestCardCardTypeComponent ]
})
export class RequestCardCardTypeModule {}
