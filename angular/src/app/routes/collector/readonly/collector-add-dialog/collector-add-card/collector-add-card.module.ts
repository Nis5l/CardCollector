import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { CollectorAddCardComponent } from './collector-add-card.component';
import { CollectorAddCardService } from './collector-add-card.service';
import { CardTypeSelectorModule } from './card-type-selector';
import { HttpModule, LoadingModule } from '../../../../../shared/services';
import { CardModule } from '../../../../../shared/components';
import { NgVarModule } from '../../../../../shared/directives';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,

		...MATERIAL_MODULES,

		HttpModule,
		CardModule,
		NgVarModule,
		LoadingModule,

		CardTypeSelectorModule,
	],
	providers: [ CollectorAddCardService ],
	declarations: [ CollectorAddCardComponent ],
	exports: [ CollectorAddCardComponent ],
})
export class CollectorAddCardModule {}
