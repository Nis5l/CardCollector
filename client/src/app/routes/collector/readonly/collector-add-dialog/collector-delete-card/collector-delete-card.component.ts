import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, Observable, startWith, shareReplay, switchMap, filter, map, combineLatest, distinctUntilChanged, EMPTY } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CollectorDeleteCardService } from './collector-delete-card.service';
import type { Card, CardType, Id, CardConfig } from '../../../../../shared/types';
import { CardState } from '../../../../../shared/types';
import { SubscriptionManagerComponent } from '../../../../../shared/abstract';
import { HttpService, LoadingService, CardService } from '../../../../../shared/services';
import type { CardDeleteRequest } from './types';

type CollectorUpdateCardFormGroup = FormGroup<{
    card: FormControl<Card | null>
}>;

//TODO: only valid if selection actually changed
@Component({
    selector: "cc-collector-delete-card",
    templateUrl: "./collector-delete-card.component.html",
    styleUrls: ["./collector-delete-card.component.scss"],
    standalone: false
})
export class CollectorDeleteCardComponent extends SubscriptionManagerComponent {
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

	private readonly cardSubject: BehaviorSubject<Card | null> = new BehaviorSubject<Card | null>(null);

	public readonly card$: Observable<Card | null>;

	public readonly cardFormControl: FormControl<Card | null> = new FormControl(null);
	public readonly formGroup: CollectorUpdateCardFormGroup;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(
		private readonly collectorDeleteCardService: CollectorDeleteCardService,
		private readonly cardService: CardService,
		private readonly loadingService: LoadingService,
	) {
		super();
		this.formGroup = new FormGroup({
      card: new FormControl<Card | null>(null, {
        validators: [ Validators.required ],
      }),
    });

    this.formGroup.controls.card.valueChanges.pipe(
      distinctUntilChanged((a, b) => a?.cardInfo.id === b?.cardInfo.id),
    ).subscribe(card => {
      this.cardSubject.next(card);
    });

		this.card$ = this.cardSubject.asObservable().pipe(
      //distinctUntilChanged()
    );

		this.error$ = this.errorSubject.asObservable();

    this.collectorId$ = this.collectorIdSubject.pipe(
      filter((collectorId): collectorId is Id => collectorId != null)
    );
	}

	public cardDeleteRequest(): void {
    const card = this.cardSubject.getValue();
    if(card == null) throw new Error("card not set");

		const req: CardDeleteRequest = {
      cardId: card.cardInfo.id,
		};

		this.loadingService.waitFor(this.collectorDeleteCardService.deleteCardRequest(req)).subscribe({
			complete: () => { this.onClose.emit(); },
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Creating request failed");
			}
		});
	}
}
