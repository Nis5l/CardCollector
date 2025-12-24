import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, shareReplay, BehaviorSubject, filter, map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CollectorDeleteCardTypeService } from './collector-delete-card-type.service';
import type { Id, CardType, CardTypeConfig } from '../../../../../shared/types';
import { CardState } from '../../../../../shared/types';
import { LoadingService, CardService } from '../../../../../shared/services';

type CollectorUpdateCardTypeFormGroup = FormGroup<{
  type: FormControl<CardType | null>,
}>;

@Component({
    selector: 'cc-collector-delete-card-type',
    templateUrl: './collector-delete-card-type.component.html',
    styleUrls: ['./collector-delete-card-type.component.scss'],
    standalone: false
})
export class CollectorDeleteCardTypeComponent {
  public readonly CardState: typeof CardState = CardState;

	@Output()
	public readonly onClose: EventEmitter<void> = new EventEmitter<void>();

	private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
	public readonly collectorId$: Observable<Id>;
	@Input()
	public set collectorId(id: Id | null | undefined) {
    if(id == null) return;
    this.collectorIdSubject.next(id);
	}
	public get collectorId(): Id {
    const collectorId = this.collectorIdSubject.getValue();
		if(collectorId == null) throw new Error("collectorId not set");
		return collectorId;
	}

	public readonly formGroup: CollectorUpdateCardTypeFormGroup;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(
    private readonly collectorDeleteCardTypeService: CollectorDeleteCardTypeService,
    private readonly loadingService: LoadingService,
  ) {
		this.formGroup = new FormGroup({
      type: new FormControl<CardType | null>(null, {
        nonNullable: true,
        validators: [
          Validators.required,
        ]
      }),
    });

    this.collectorId$ = this.collectorIdSubject.pipe(
      filter((collectorId): collectorId is Id => collectorId != null)
    );

		this.error$ = this.errorSubject.asObservable();
	}

	public deleteCardTypeRequest(collectorId: Id): void {
    const { type } = this.formGroup.getRawValue();
    if(type == null) throw new Error("Card type not set");
		this.loadingService.waitFor(this.collectorDeleteCardTypeService.deleteCollectorRequest(collectorId, { cardTypeId: type.id })).subscribe({
			next: () => { this.onClose.emit() },
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Updating type failed");
			}
		})
	}
}
