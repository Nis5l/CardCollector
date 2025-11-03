import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { HttpModule } from '../../../../../shared/services';
import { NgVarModule } from '../../../../../shared/directives';
import { CollectorAddCardTypeComponent } from './collector-add-card-type.component';
import { CollectorAddCardTypeService } from './collector-add-card-type.service';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,

		HttpModule,
		NgVarModule,
		
		...MATERIAL_MODULES,
	],
	providers: [ CollectorAddCardTypeService ],
	declarations: [ CollectorAddCardTypeComponent ],
	exports: [ CollectorAddCardTypeComponent ]
})
export class CollectorAddCardTypeModule {}
