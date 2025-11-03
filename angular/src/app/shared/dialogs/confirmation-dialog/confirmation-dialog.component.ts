import { Component, Inject } from '@angular/core';
import { MatLegacyDialog as MatDialog, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';

@Component({
	selector: 'cc-confirmation-dialog',
	templateUrl: './confirmation-dialog.component.html',
	styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
	public readonly message: string;

	constructor(
		private readonly dialogRef: MatDialogRef<ConfirmationDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data: { message: string }
	) {
		this.message = data.message
	}

	public static open(matDialog: MatDialog, message: string): Observable<boolean | undefined> {
		return matDialog.open<ConfirmationDialogComponent, { message: string }, boolean>(ConfirmationDialogComponent, { data: { message } }).afterClosed();
	}

	public yes(): void {
		this.dialogRef.close(true);
	}

	public cancel(): void {
		this.dialogRef.close(false);
	}
}
