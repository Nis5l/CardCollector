import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { HttpModule, CardServiceModule } from '../../../../../shared/services';
import { NgVarModule } from '../../../../../shared/directives';
import { CollectorUpdateCardTypeComponent } from './collector-update-card-type.component';
import { CollectorUpdateCardTypeService } from './collector-update-card-type.service';
import { CollectorServiceModule, CardTypeSelectorModule } from '../../../shared';

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
    CollectorServiceModule,
    CardTypeSelectorModule,
	],
	providers: [ CollectorUpdateCardTypeService ],
	declarations: [ CollectorUpdateCardTypeComponent ],
	exports: [ CollectorUpdateCardTypeComponent ]
})
export class CollectorUpdateCardTypeModule {}
