import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, switchMap, filter, startWith, Subject } from 'rxjs';

import type { CardType, Id } from '../../../../../../shared/types';
import { RequestCardCardTypeService } from './request-card-card-type.service';
import { LoadingService, CardService } from '../../../../../../shared/services';
import { SubscriptionManagerComponent } from '../../../../../../shared/abstract';
import type { VoteGetResponse } from './types';
import type { CardVote } from '../shared/types';

//TODO: ADD TIMES FOR ALL CARDS
//TODO: CHAT

@Component({
    selector: 'cc-request-card-card-type',
    templateUrl: './request-card-card-type.component.html',
    styleUrls: ['./request-card-card-type.component.scss'],
    standalone: false
})
export class RequestCardCardTypeComponent extends SubscriptionManagerComponent {
	@Output()
	public readonly onRemove: EventEmitter<void> = new EventEmitter<void>();

	private readonly refreshVoteSubject: Subject<void> = new Subject();

	private readonly cardTypeSubject: BehaviorSubject<CardType | null> = new BehaviorSubject<CardType | null>(null);
	@Input()
	public set cardType(cardType: CardType | undefined | null) {
    if(cardType == null) return;
    this.cardTypeSubject.next(cardType);
	}
	public get cardType(): CardType {
    const cardType = this.cardTypeSubject.getValue();
		if(cardType == null) throw new Error("cardType not set");
		return cardType;
	}

	private _collectorId: Id | null = null;
	@Input()
	public set collectorId(id: Id) {
		this._collectorId = id;
	}
	public get collectorId(): Id {
		if(this._collectorId == null) throw new Error("collectorId not set");
		return this._collectorId;
	}

  public readonly voteResponse$: Observable<VoteGetResponse>;

	constructor(
		private readonly requestCardCardTypeService: RequestCardCardTypeService,
		private readonly loadingService: LoadingService,
    private readonly cardService: CardService,
	) {
		super();

    const cardType$: Observable<CardType> = this.cardTypeSubject.asObservable().pipe(
      filter((cardType): cardType is CardType => cardType != null)
    );

    /* cardType$.pipe(
      filter(cardType =>
    ); */

    this.voteResponse$ = combineLatest([cardType$, this.refreshVoteSubject.pipe(startWith(0))]).pipe(
      switchMap(([cardType]) => this.requestCardCardTypeService.votes(cardType.id))
    );
	}

	public accept(): void {
		this.registerSubscription(this.loadingService.waitFor(this.requestCardCardTypeService.accept(this.cardType.id)).subscribe({
			next: () => this.onRemove.next(),
			error: () => console.error("Error accepting Card-Type Request")
		}));
	}

	public decline(): void {
		this.registerSubscription(this.loadingService.waitFor(this.requestCardCardTypeService.decline(this.cardType.id)).subscribe({
			next: () => this.onRemove.next(),
			error: () => console.error("Error declining Card-Type Request")
		}));
	}

	public vote(cardTypeId: Id, vote: CardVote): void {
    this.registerSubscription(this.requestCardCardTypeService.vote(cardTypeId, vote).subscribe(
      () => this.refreshVoteSubject.next()
    ));
	}
}
