import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@NgModule({
	imports: [
		MatButtonModule
	],
	declarations: [ ConfirmationDialogComponent ]
})
export class ConfirmationDialogModule {}
