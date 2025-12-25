import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, switchMap, filter, startWith, Subject, map, of as observableOf } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { RequestCardCardService } from './request-card-card.service';
import type { Card, Id } from '../../../../../../shared/types';
import { CardState } from '../../../../../../shared/types';
import { SubscriptionManagerComponent } from '../../../../../../shared/abstract';
import { LoadingService } from '../../../../../../shared/services';
import { IUnderstandDialogComponent } from '../../../../../../shared/dialogs';
import type { VoteGetResponse } from './types';
import type { CardVote } from '../shared/types';

@Component({
    selector: 'cc-request-card-card',
    templateUrl: './request-card-card.component.html',
    styleUrls: ['./request-card-card.component.scss'],
    standalone: false
})
export class RequestCardCardComponent extends SubscriptionManagerComponent {
	@Output()
	public readonly onRemove: EventEmitter<void> = new EventEmitter<void>();

	private readonly refreshVoteSubject: Subject<void> = new Subject();

	private readonly cardSubject: BehaviorSubject<Card | null> = new BehaviorSubject<Card | null>(null);
	@Input()
	public set card(card: Card | undefined | null) {
    if(card == null) return;
    this.cardSubject.next(card);
	}
	public get card(): Card {
    const card = this.cardSubject.getValue();
		if(card == null) throw new Error("card not set");
		return card;
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

  public readonly title$: Observable<string>;

	constructor(
		private readonly loadingService: LoadingService,
		private readonly requestCardCardService: RequestCardCardService,
    private readonly matDialog: MatDialog,
	) {
		super();
    const card$: Observable<Card> = this.cardSubject.asObservable().pipe(
      filter((card): card is Card => card != null)
    );

    this.title$ = card$.pipe(
      map(card => {
        if(card.cardInfo.state == CardState.Delete) return "Delete Card";
        return (card.updateCard == null ? 'Create' : 'Update') + " Card";
      }),
    );

    this.voteResponse$ = combineLatest([card$, this.refreshVoteSubject.pipe(startWith(0))]).pipe(
      switchMap(([card]) => this.requestCardCardService.votes(card.cardInfo.id))
    );
	}

	public accept(): void {
		this.registerSubscription((this.card.cardInfo.state === CardState.Delete ? IUnderstandDialogComponent.open(this.matDialog, "Deleting this Card will remove it from all inventories!") : observableOf(true)).pipe(
      filter(result => result === true),
      switchMap(() => this.loadingService.waitFor(this.requestCardCardService.accept(this.card.cardInfo.id)))
    ).subscribe({
			next: () => this.onRemove.next(),
			error: () => console.error("Error accepting Card Request")
		}));
	}

	public decline(): void {
		this.registerSubscription(this.loadingService.waitFor(this.requestCardCardService.decline(this.card.cardInfo.id)).subscribe({
			next: () => this.onRemove.next(),
			error: () => console.error("Error declining Card Request")
		}));
	}

	public vote(cardId: Id, vote: CardVote): void {
    this.registerSubscription(this.requestCardCardService.vote(cardId, vote).subscribe(
      () => this.refreshVoteSubject.next()
    ));
	}
}
