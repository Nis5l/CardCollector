import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CollectorUpdateCardComponent } from './collector-update-card.component';
import { CollectorUpdateCardService } from './collector-update-card.service';
import { CardTypeSelectorModule } from '../../../shared';
import { HttpModule, LoadingModule } from '../../../../../shared/services';
import { CardModule, CardSelectorModule } from '../../../../../shared/components';
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

    CardSelectorModule,
		CardTypeSelectorModule,
	],
	providers: [ CollectorUpdateCardService ],
	declarations: [ CollectorUpdateCardComponent ],
	exports: [ CollectorUpdateCardComponent ],
})
export class CollectorUpdateCardModule {}
