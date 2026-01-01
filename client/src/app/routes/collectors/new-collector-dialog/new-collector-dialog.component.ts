import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, map, shareReplay } from 'rxjs';

import { CollectorService } from '../../collector/shared';
import type { CollectorConfig } from '../../collector/types';
import { NewCollectorDialogService } from './new-collector-dialog.service';

import { SubscriptionManagerComponent } from '../../../shared/abstract';

type LocalFormGroup = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
}>

@Component({
    selector: "cc-new-collector-dialog",
    templateUrl: "./new-collector-dialog.component.html",
    styleUrls: ["./new-collector-dialog.component.scss"],
    standalone: false
})
export class NewCollectorDialogComponent extends SubscriptionManagerComponent {
  public formGroup$: Observable<LocalFormGroup>;
  public config$: Observable<CollectorConfig>;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(
		public readonly newCollectorDialogService: NewCollectorDialogService,
		private readonly collectorService: CollectorService,
		public readonly dialogRef: MatDialogRef<NewCollectorDialogComponent>,
		private readonly router: Router,
	) {
		super();
		this.error$ = this.errorSubject.asObservable();

    this.config$ = this.collectorService.getConfig().pipe(shareReplay(1));

    //TODO: loadingservice?
		this.formGroup$ = this.config$.pipe(
      map(config => new FormGroup({
          name: new FormControl("", {
            nonNullable: true,
            validators: [ Validators.required, Validators.minLength(config.name.min), Validators.maxLength(config.name.max) ]
          }),
          description: new FormControl("", {
            nonNullable: true,
            validators: [ Validators.required, Validators.minLength(config.description.min), Validators.maxLength(config.description.max) ]
          })
        })
       ),
    );
	}

	public static open(matDialog: MatDialog): Observable<undefined> {
		return matDialog.open<NewCollectorDialogComponent, undefined, undefined>(NewCollectorDialogComponent, {
      panelClass: "responsive-dialog"
    }).afterClosed();
	}

	public onCreate(formGroup: LocalFormGroup): void {
		this.registerSubscription(
			this.newCollectorDialogService.createCollector(formGroup.getRawValue()).subscribe({
				next: res => {
					this.errorSubject.next(null);
					this.dialogRef.close();
					this.router.navigate(["collector", res.id]);
				},
				error: (err: HttpErrorResponse) => {
					this.errorSubject.next(err.error?.error ?? "Creating collector failed");
				}
			})
		);
	}
}
