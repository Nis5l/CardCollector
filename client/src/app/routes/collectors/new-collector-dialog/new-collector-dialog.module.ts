import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { CollectorImageModule } from '../../collector';
import { ImageCircleModule } from '../../../shared/components';
import { LoadingModule } from '../../../shared/services/loading';
import { NewCollectorDialogService } from './new-collector-dialog.service';
import { NewCollectorDialogComponent } from './new-collector-dialog.component';
import { CollectorService } from '../../collector/collector.service';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
  MatToolbarModule,
  MatIconModule,
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
	],
	providers: [ NewCollectorDialogService, CollectorService ],
	declarations: [ NewCollectorDialogComponent ],
})
export class NewCollectorDialogModule {}
