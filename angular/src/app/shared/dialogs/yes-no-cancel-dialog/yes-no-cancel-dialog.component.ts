import { Component, Inject } from '@angular/core';
import { MatLegacyDialog as MatDialog, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';

@Component({
	selector: 'cc-yes-no-cancel-dialog',
	templateUrl: './yes-no-cancel-dialog.component.html',
	styleUrls: ['./yes-no-cancel-dialog.component.scss']
})
export class YesNoCancelDialogComponent {
	public readonly message: string;

	constructor(
		private readonly dialogRef: MatDialogRef<YesNoCancelDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data: { message: string }
	) {
		this.message = data.message
	}

	public static open(matDialog: MatDialog, message: string): Observable<boolean | undefined> {
		return matDialog.open<YesNoCancelDialogComponent, { message: string }, boolean>(YesNoCancelDialogComponent, { data: { message } }).afterClosed();
	}

	public yes(): void {
		this.dialogRef.close(true);
	}

	public no(): void {
		this.dialogRef.close(false);
	}

	public cancel(): void {
		this.dialogRef.close(undefined);
	}
}
