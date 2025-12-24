import { Component, Inject } from '@angular/core';
import { FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

@Component({
    selector: 'cc-i-understand-dialog',
    templateUrl: './i-understand-dialog.component.html',
    styleUrls: ['./i-understand-dialog.component.scss'],
    standalone: false
})
export class IUnderstandDialogComponent {
  public readonly understandText = "I UNDERSTAND";
	public readonly message: string;

	public readonly formControl: FormControl<string>;

	constructor(
		private readonly dialogRef: MatDialogRef<IUnderstandDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data: { message: string }
	) {
		this.message = data.message

    this.formControl = new FormControl('', {
      nonNullable: true,
      validators: [this.mustTypeUnderstandValidator()]
    });
	}

	public static open(matDialog: MatDialog, message: string): Observable<boolean | undefined> {
		return matDialog.open<IUnderstandDialogComponent, { message: string }, boolean>(IUnderstandDialogComponent, {
      data: { message },
      panelClass: "responsive-dialog"
    }).afterClosed();
	}

  public confirm(): void {
    if (this.formControl.value === this.understandText) {
      this.dialogRef.close(true);
    }
  }

  public cancel(): void {
    this.dialogRef.close(false);
  }

  private mustTypeUnderstandValidator(): ValidatorFn {
    return (control: AbstractControl<string>) => {
      return control.value === this.understandText ? null : { mustTypeUnderstand: true };
    };
  }
}
