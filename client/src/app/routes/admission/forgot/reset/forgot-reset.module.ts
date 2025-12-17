import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ForgotResetComponent } from './forgot-reset.component';
import { ForgotResetService } from './forgot-reset.service';
import { HttpModule } from '../../../../shared/services';
import { NgVarModule } from '../../../../shared/directives';

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
    NgVarModule,
	],
	declarations: [ ForgotResetComponent ],
	providers: [
		ForgotResetService
	],
})
export class ForgotResetModule {}
