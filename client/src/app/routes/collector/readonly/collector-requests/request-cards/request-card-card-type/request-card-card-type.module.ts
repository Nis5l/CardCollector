import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { RequestCardCardTypeComponent } from './request-card-card-type.component';
import { RequestCardCardTypeService } from './request-card-card-type.service';
import { RequestCardModule } from '../shared';
import { HttpModule, CardServiceModule } from '../../../../../../shared/services';

const MATERIAL_MODULES = [
  MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

    ...MATERIAL_MODULES,

		HttpModule,

    CardServiceModule,
		RequestCardModule,
	],
	providers: [ RequestCardCardTypeService ],
	declarations: [ RequestCardCardTypeComponent ],
	exports: [ RequestCardCardTypeComponent ]
})
export class RequestCardCardTypeModule {}
