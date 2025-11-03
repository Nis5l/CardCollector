import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { HttpModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import { AdmissionModule } from '../admission-service';
import { RegisterComponent } from './register.component';
import { RegisterService } from './register.service';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
	MatCardModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		RouterModule,

		...MATERIAL_MODULES,
		HttpModule,
		AdmissionModule,
		NgVarModule,
	],
	declarations: [ RegisterComponent ],
	providers: [ RegisterService ],
})
export class RegisterModule {}
