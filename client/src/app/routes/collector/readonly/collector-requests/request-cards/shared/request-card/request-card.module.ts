import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';

import { RequestCardComponent } from './request-card.component';
import { UserModule } from '../../../../../../../shared/components';
import { NgVarModule } from '../../../../../../../shared/directives';
import { UserModule as UserServiceModule } from '../../../../../../../shared/services';
import { ConfirmationDialogModule } from '../../../../../../../shared/dialogs';

const MATERIAL_MODULES = [
	MatCardModule,
	MatButtonModule,
	MatIconModule,
	MatDividerModule,
	MatDialogModule
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

    NgVarModule,

		UserModule,
		UserServiceModule,
		ConfirmationDialogModule,
	],
	declarations: [ RequestCardComponent ],
	exports: [ RequestCardComponent ]
})
export class RequestCardModule {}
