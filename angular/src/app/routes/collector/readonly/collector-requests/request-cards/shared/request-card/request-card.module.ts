import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

import { RequestCardComponent } from './request-card.component';
import { UserModule } from '../../../../../../../shared/components';
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

		UserModule,
		UserServiceModule,
		ConfirmationDialogModule,
	],
	declarations: [ RequestCardComponent ],
	exports: [ RequestCardComponent ]
})
export class RequestCardModule {}
