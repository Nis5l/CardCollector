import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import type { SelectCardDialogConfig } from './types';
import type { Id, Card } from '../../types';

@Component({
    selector: 'cc-select-card-dialog',
    templateUrl: './select-card-dialog.component.html',
    styleUrls: ['./select-card-dialog.component.scss'],
    standalone: false
})
export class SelectCardDialogComponent {
  public readonly collectorId: Id;
  public readonly title: string;

	constructor(
		public readonly dialogRef: MatDialogRef<SelectCardDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data: SelectCardDialogConfig
	) {
    this.title = data.title;
    this.collectorId = data.collectorId;
	}

	public static open(matDialog: MatDialog, config: SelectCardDialogConfig): Observable<Card | null | undefined> {
		return matDialog.open<SelectCardDialogComponent, SelectCardDialogConfig, Card | null | undefined>(SelectCardDialogComponent, {
      data: config,
      panelClass: "responsive-dialog"
    }).afterClosed();
	}

  public onCardSelect(card: Card) {
    this.dialogRef.close(card);
  }
}
