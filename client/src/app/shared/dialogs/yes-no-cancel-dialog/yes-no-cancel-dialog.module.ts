import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { YesNoCancelDialogComponent } from './yes-no-cancel-dialog.component';

@NgModule({
	imports: [
		MatButtonModule,
    MatToolbarModule,
    MatIconModule,
	],
	declarations: [ YesNoCancelDialogComponent ]
})
export class YesNoCancelDialogModule {}
