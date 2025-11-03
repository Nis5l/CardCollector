import { Component, Inject } from '@angular/core';
import { MatLegacyDialog as MatDialog, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';

import type { Id } from '../../../../shared/types';

@Component({
	selector: "cc-collector-add-dialog",
	templateUrl: "./collector-add-dialog.component.html",
	styleUrls: [ "./collector-add-dialog.component.scss" ]
})
export class CollectorAddDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public readonly collectorId: Id) {}

	public static open(matDialog: MatDialog, collectorId: Id): Observable<undefined> {
		return matDialog.open<CollectorAddDialogComponent, Id, undefined>(CollectorAddDialogComponent, { data: collectorId }).afterClosed();
	}
}
