import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestCardCardComponent } from './request-card-card.component';
import { RequestCardCardService } from './request-card-card.service';
import { RequestCardModule } from '../shared';
import { CardModule } from '../../../../../../shared/components';
import { LoadingModule } from '../../../../../../shared/services';

@NgModule({
	imports: [
		CommonModule,

		RequestCardModule,

		LoadingModule,
		CardModule,
	],
	providers: [ RequestCardCardService ],
	declarations: [ RequestCardCardComponent ],
	exports: [ RequestCardCardComponent ]
})
export class RequestCardCardModule {}
