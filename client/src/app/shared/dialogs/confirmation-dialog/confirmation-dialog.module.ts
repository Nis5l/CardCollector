import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@NgModule({
	imports: [
		MatButtonModule
	],
	declarations: [ ConfirmationDialogComponent ]
})
export class ConfirmationDialogModule {}
