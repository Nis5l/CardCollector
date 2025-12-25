import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, Observable, startWith, shareReplay, switchMap, filter, map, combineLatest, distinctUntilChanged, EMPTY } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CollectorUpdateCardService } from './collector-update-card.service';
import type { Card, CardType, Id, CardConfig } from '../../../../../shared/types';
import { CardState } from '../../../../../shared/types';
import { SubscriptionManagerComponent } from '../../../../../shared/abstract';
import { HttpService, LoadingService, CardService } from '../../../../../shared/services';
import { eventGetImage } from '../../../../../shared/utils';
import type { CardUpdateRequest } from './types';

type CollectorUpdateCardFormGroup = FormGroup<{
    card: FormControl<Card | null>,
    name: FormControl<string>,
    type: FormControl<CardType | null>,
}>;

//TODO: only valid if selection actually changed
@Component({
    selector: "cc-collector-update-card",
    templateUrl: "./collector-update-card.component.html",
    styleUrls: ["./collector-update-card.component.scss"],
    standalone: false
})
export class CollectorUpdateCardComponent extends SubscriptionManagerComponent {
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

	private readonly cardSubject: BehaviorSubject<Card | null> = new BehaviorSubject<Card | null>(null);

	public readonly cardImage$: Observable<string | SafeResourceUrl>;
	public readonly card$: Observable<Card | null>;
	public readonly config$: Observable<CardConfig>;

	public readonly cardFormControl: FormControl<Card | null> = new FormControl(null);
	public readonly formGroup$: Observable<CollectorUpdateCardFormGroup>;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(
		private readonly domSanitizer: DomSanitizer,
		private readonly collectorUpdateCardService: CollectorUpdateCardService,
		private readonly cardService: CardService,
		private readonly loadingService: LoadingService,
	) {
		super();
		this.config$ = this.cardService.getCardConfig().pipe(shareReplay(1));

		this.formGroup$ = this.config$.pipe(
      map(config => new FormGroup({
        card: new FormControl<Card | null>(null, {
          validators: [ Validators.required ],
        }),
        name: new FormControl({ value: "", disabled: true }, {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.minLength(config.nameLengthMin),
            Validators.maxLength(config.nameLengthMax),
          ],
        }),
        type: new FormControl<CardType | null>({ value: null, disabled: true }, {
          validators: [ Validators.required ],
        }),
      })),
      shareReplay(1)
    );

    this.registerSubscription(this.formGroup$.pipe(
      switchMap(formGroup => formGroup.controls.card.valueChanges.pipe(
        distinctUntilChanged((a, b) => a?.cardInfo.id === b?.cardInfo.id),
        map(card => ({ card, formGroup }))
      )),
    ).subscribe(({ card, formGroup }) => {
      [formGroup.controls.name, formGroup.controls.type].forEach(c => card == null ? c.disable() : c.enable());

      formGroup.controls.name.setValue(card?.cardInfo.name ?? "", { emitEvent: false });
      formGroup.controls.type.setValue(card?.cardType ?? null, { emitEvent: false });

      this.cardSubject.next(card);
    }));

		this.card$ = this.cardSubject.asObservable().pipe(
      //distinctUntilChanged()
    );

		this.registerSubscription(combineLatest([this.card$, this.formGroup$]).pipe(
        filter((v): v is [Card, CollectorUpdateCardFormGroup] => v[0] != null),
        switchMap(([card, formGroup]) => combineLatest([
          formGroup.controls.name.valueChanges.pipe(startWith(card.cardInfo.name)),
          formGroup.controls.type.valueChanges.pipe(startWith(card.cardType))
        ]).pipe(
          map(([name, type]) => ({ name, type, card }))
        )),
        filter(({ card, name, type }) => card.cardInfo.name !== name || type?.id !== card.cardType.id)
      ).subscribe(({card, name, type}) => {
        this.cardSubject.next({
          ...card,
          cardInfo: {
            ...card.cardInfo,
            name: name ?? card.cardInfo.name
          },
          cardType: type ?? { ...card.cardType, name: "" }
        });
		  })
    );

		this.cardImage$ = this.imageSubject.asObservable().pipe(
			filter((image): image is File => image != null),
			map(image => this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(image))),
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

	public cardUpdateRequest(): void {
    const card = this.cardSubject.getValue();
    if(card == null) throw new Error("card not set");

		const req: CardUpdateRequest = {
      cardId: card.cardInfo.id,
			cardType: card.cardType.id,
			name: card.cardInfo.name,
		};
		const image = this.imageSubject.getValue();

		this.loadingService.waitFor(this.collectorUpdateCardService.updateCardRequest(req).pipe(
			switchMap(({ id }) => image ? this.cardService.setCardImage(id, image) : EMPTY)
		)).subscribe({
			complete: () => { this.onClose.emit(); },
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Creating request failed");
			}
		});
	}
}
