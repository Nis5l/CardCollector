import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { RequestCardCardComponent } from './request-card-card.component';
import { RequestCardCardService } from './request-card-card.service';
import { RequestCardModule } from '../shared';
import { CardModule } from '../../../../../../shared/components';
import { LoadingModule } from '../../../../../../shared/services';

const MATERIAL_MODULES = [
  MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

    ...MATERIAL_MODULES,

		RequestCardModule,

		LoadingModule,
		CardModule,
	],
	providers: [ RequestCardCardService ],
	declarations: [ RequestCardCardComponent ],
	exports: [ RequestCardCardComponent ]
})
export class RequestCardCardModule {}
