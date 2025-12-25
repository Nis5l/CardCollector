import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, shareReplay, BehaviorSubject, filter, map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CollectorUpdateCardTypeService } from './collector-update-card-type.service';
import type { Id, CardType, CardTypeConfig } from '../../../../../shared/types';
import { CardState } from '../../../../../shared/types';
import { LoadingService, CardService } from '../../../../../shared/services';

type CollectorUpdateCardTypeFormGroup = FormGroup<{
  type: FormControl<CardType | null>,
  name: FormControl<string>
}>;

@Component({
    selector: 'cc-collector-update-card-type',
    templateUrl: './collector-update-card-type.component.html',
    styleUrls: ['./collector-update-card-type.component.scss'],
    standalone: false
})
export class CollectorUpdateCardTypeComponent {
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

	public readonly config$: Observable<CardTypeConfig>;
	public readonly formGroup$: Observable<CollectorUpdateCardTypeFormGroup>;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(
    private readonly collectorUpdateCardTypeService: CollectorUpdateCardTypeService,
    private readonly cardService: CardService,
    private readonly loadingService: LoadingService,
  ) {
		this.config$ = this.cardService.getCardTypeConfig().pipe(shareReplay(1));

		this.formGroup$ = this.config$.pipe(
      map(config => new FormGroup({
        name: new FormControl("", {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.pattern("^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$"),
            Validators.minLength(config.nameLengthMin),
            Validators.maxLength(config.nameLengthMax),
          ]
        }),
        type: new FormControl<CardType | null>(null, {
          nonNullable: true,
          validators: [
            Validators.required,
          ]
        }),
      })
    ));

    this.collectorId$ = this.collectorIdSubject.pipe(
      filter((collectorId): collectorId is Id => collectorId != null)
    );

		this.error$ = this.errorSubject.asObservable();
	}

	public updateCardTypeRequest(collectorId: Id, formGroup: CollectorUpdateCardTypeFormGroup): void {
    const { name, type } = formGroup.getRawValue();
    if(type == null) throw new Error("Card type not set");
		this.loadingService.waitFor(this.collectorUpdateCardTypeService.updateCollectorRequest(collectorId, { name, cardTypeId: type.id })).subscribe({
			next: () => { this.onClose.emit() },
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Creating request failed");
			}
		})
	}
}
