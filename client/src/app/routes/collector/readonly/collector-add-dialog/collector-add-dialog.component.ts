import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import type { Id } from '../../../../shared/types';

@Component({
    selector: "cc-collector-add-dialog",
    templateUrl: "./collector-add-dialog.component.html",
    styleUrls: ["./collector-add-dialog.component.scss"],
    standalone: false
})
export class CollectorAddDialogComponent {
	constructor(
    private readonly dialogRef: MatDialogRef<CollectorAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly collectorId: Id
  ) {}

	public static open(matDialog: MatDialog, collectorId: Id): Observable<"refresh" | undefined> {
		return matDialog.open<CollectorAddDialogComponent, Id, undefined>(CollectorAddDialogComponent, {
      data: collectorId,
      width: "min(800px, 70vw)"
    }).afterClosed();
	}

  public close(): void {
    this.dialogRef.close("refresh");
  }
}
