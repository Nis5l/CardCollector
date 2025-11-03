import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { YesNoCancelDialogComponent } from './yes-no-cancel-dialog.component';

@NgModule({
	imports: [
		MatButtonModule
	],
	declarations: [ YesNoCancelDialogComponent ]
})
export class YesNoCancelDialogModule {}
