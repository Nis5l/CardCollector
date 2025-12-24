import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { HttpModule, CardServiceModule } from '../../../../../shared/services';
import { NgVarModule } from '../../../../../shared/directives';
import { CollectorDeleteCardTypeComponent } from './collector-delete-card-type.component';
import { CollectorDeleteCardTypeService } from './collector-delete-card-type.service';
import { CardTypeSelectorModule } from '../../../shared';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,

		...MATERIAL_MODULES,

    CardServiceModule,
		HttpModule,
		NgVarModule,
    CardTypeSelectorModule,
	],
	providers: [ CollectorDeleteCardTypeService ],
	declarations: [ CollectorDeleteCardTypeComponent ],
	exports: [ CollectorDeleteCardTypeComponent ]
})
export class CollectorDeleteCardTypeModule {}
