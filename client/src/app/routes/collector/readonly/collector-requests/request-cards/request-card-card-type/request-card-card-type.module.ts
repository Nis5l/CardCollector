import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { RequestCardCardTypeComponent } from './request-card-card-type.component';
import { RequestCardCardTypeService } from './request-card-card-type.service';
import { RequestCardModule } from '../shared';
import { HttpModule } from '../../../../../../shared/services';
import { IUnderstandDialogModule } from '../../../../../../shared/dialogs';

const MATERIAL_MODULES = [
  MatDialogModule,
  MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

    ...MATERIAL_MODULES,

		HttpModule,

		RequestCardModule,
    IUnderstandDialogModule,
	],
	providers: [ RequestCardCardTypeService ],
	declarations: [ RequestCardCardTypeComponent ],
	exports: [ RequestCardCardTypeComponent ]
})
export class RequestCardCardTypeModule {}
