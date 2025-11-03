import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { YesNoCancelDialogComponent } from './yes-no-cancel-dialog.component';

@NgModule({
	imports: [
		MatButtonModule
	],
	declarations: [ YesNoCancelDialogComponent ]
})
export class YesNoCancelDialogModule {}
