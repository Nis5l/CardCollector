import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, Observable, shareReplay, switchMap, filter, map, startWith } from 'rxjs';
import type { HttpErrorResponse } from '@angular/common/http';

import { CollectorAddCardService } from './collector-add-card.service';
import type { Card, CardType, Id, CardConfig } from '../../../../../shared/types';
import { CardState } from '../../../../../shared/types';
import { SubscriptionManagerComponent } from '../../../../../shared/abstract';
import { HttpService, LoadingService, CardService } from '../../../../../shared/services';
import { eventGetImage } from '../../../../../shared/utils';
import type { CardRequestRequest } from './types';

type CollectorAddCardFormGroup = FormGroup<{
    name: FormControl<string>,
    type: FormControl<CardType | null>,
}>;

@Component({
    selector: "cc-collector-add-card",
    templateUrl: "./collector-add-card.component.html",
    styleUrls: ["./collector-add-card.component.scss"],
    standalone: false
})
export class CollectorAddCardComponent extends SubscriptionManagerComponent {
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

	private readonly imageSubject: BehaviorSubject<File | null> = new BehaviorSubject<File | null>(null);
	public readonly cardImage$: Observable<string | SafeResourceUrl>;
	private readonly cardTypeDefault: CardType = {
		id: "id",
		name: "",
		userId: null,
    state: CardState.Created,
    updateCardType: null
	};

	private readonly cardSubject: BehaviorSubject<Card> = new BehaviorSubject<Card>({
    collectorId: "collectorId",
    cardInfo: {
      id: "id",
      userId: "userId",
      name: "",
      time: (new Date()).toISOString(),
      state: CardState.Created,
      updateCard: null,
    },
    cardType: this.cardTypeDefault
	});

	public readonly card$: Observable<Card>;
	public readonly config$: Observable<CardConfig>;

	public readonly formGroup$: Observable<CollectorAddCardFormGroup>;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(
		private readonly httpService: HttpService,
		private readonly domSanitizer: DomSanitizer,
		private readonly collectorAddCardService: CollectorAddCardService,
		private readonly cardService: CardService,
		private readonly loadingService: LoadingService,
	) {
		super();
		this.config$ = this.cardService.getCardConfig().pipe(shareReplay(1));

		this.formGroup$ = this.config$.pipe(
      map(config => new FormGroup({
        name: new FormControl("", {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.minLength(config.nameLengthMin),
            Validators.maxLength(config.nameLengthMax),
          ],
        }),
        type: new FormControl<CardType | null>(null, {
          validators: [ Validators.required ],
        }),
      })),
      shareReplay(1)
    );

		this.registerSubscription(this.formGroup$.pipe(
        switchMap(formGroup => formGroup.controls.name.valueChanges)
      ).subscribe(value => {
        const current = this.cardSubject.getValue();
        this.cardSubject.next({
          ...current,
          cardInfo: {
            ...current.cardInfo,
            name: value ?? current.cardInfo.name
          }
        });
		  })
    );

		this.card$ = this.cardSubject.asObservable();

		this.cardImage$ = this.imageSubject.asObservable().pipe(
			filter((image): image is File => image != null),
			map(image => this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(image))),
			startWith(this.httpService.apiUrl("/card/card-image")),
		);

		this.error$ = this.errorSubject.asObservable();

    this.collectorId$ = this.collectorIdSubject.pipe(
      filter((collectorId): collectorId is Id => collectorId != null)
    );
	}

	public imageChange(target: EventTarget | null): void {
		const image = eventGetImage(target);

		this.imageSubject.next(image);
	}

	public cardTypeChange(cardType: CardType | null): void {
		const current = this.cardSubject.getValue();
		if(cardType != null) {
			this.cardSubject.next({
				...current,
        cardType
			});
		} else {
			this.cardSubject.next({
				...current,
        cardType: this.cardTypeDefault
			});
		}
	}

	public createCardRequest(): void {
		const data = this.cardSubject.getValue();
		const cardData: CardRequestRequest = {
			cardType: data.cardType.id,
			name: data.cardInfo.name,
		};
		const image = this.imageSubject.getValue();
		if(image == null) throw new Error("image not set");

		this.loadingService.waitFor(this.collectorAddCardService.createCardRequest(cardData).pipe(
			switchMap(({ id }) => this.cardService.setCardImage(id, image))
		)).subscribe({
			next: () => { this.onClose.emit(); },
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Creating card failed");
			}
		})
	}
}
