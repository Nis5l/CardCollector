import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import type { SelectUserDialogConfig } from './types';
import type { Id, User } from '../../types';

@Component({
    selector: 'cc-select-user-dialog',
    templateUrl: './select-user-dialog.component.html',
    styleUrls: ['./select-user-dialog.component.scss'],
    standalone: false
})
export class SelectUserDialogComponent {
	public readonly excludeUserIds: Id[];
  public readonly title: string;

	constructor(
		public readonly dialogRef: MatDialogRef<SelectUserDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data: SelectUserDialogConfig
	) {
    this.excludeUserIds = data.excludeUserIds;
    this.title = data.title;
	}

	public static open(matDialog: MatDialog, config: SelectUserDialogConfig): Observable<User | null | undefined> {
		return matDialog.open<SelectUserDialogComponent, SelectUserDialogConfig, User | null | undefined>(SelectUserDialogComponent, {
      data: config,
      panelClass: "responsive-dialog"
    }).afterClosed();
	}

  public onUserSelect(user: User) {
    this.dialogRef.close(user);
  }
}
