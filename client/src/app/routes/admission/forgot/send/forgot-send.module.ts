import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ForgotSendComponent } from './forgot-send.component';
import { ForgotSendService } from './forgot-send.service';
import { HttpModule } from '../../../../shared/services';

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

		...MATERIAL_MODULES,

		HttpModule,
	],
	declarations: [ ForgotSendComponent ],
	providers: [
		ForgotSendService
	],
})
export class ForgotSendModule {}
