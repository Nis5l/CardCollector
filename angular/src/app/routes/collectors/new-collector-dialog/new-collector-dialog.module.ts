import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { CollectorImageModule } from '../../collector';
import { ImageCircleModule } from '../../../shared/components';
import { LoadingModule } from '../../../shared/services/loading';
import { NgVarModule } from '../../../shared/directives';
import { NewCollectorDialogService } from './new-collector-dialog.service';
import { NewCollectorDialogComponent } from './new-collector-dialog.component';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,

		...MATERIAL_MODULES,

		CollectorImageModule,
		LoadingModule,
		ImageCircleModule,
		NgVarModule,
	],
	providers: [ NewCollectorDialogService ],
	declarations: [ NewCollectorDialogComponent ],
})
export class NewCollectorDialogModule {}
