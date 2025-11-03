import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { HttpModule } from '../../shared/services';
import { NgVarModule } from '../../shared/directives';
import { LoadingModule, CollectorCardModule } from '../../shared/components';
import { NewCollectorDialogModule } from './new-collector-dialog';

import { CollectorsComponent } from './collectors.component';
import { CollectorsService } from './collectors.service';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
	MatDialogModule,
	MatPaginatorModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,

		...MATERIAL_MODULES,

		LoadingModule,
		NgVarModule,
		HttpModule,
		CollectorCardModule,
		NewCollectorDialogModule,
	],
	providers: [ CollectorsService ],
	declarations: [ CollectorsComponent ],
})
export class CollectorsModule {}
