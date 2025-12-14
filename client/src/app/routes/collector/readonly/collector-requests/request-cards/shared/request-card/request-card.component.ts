import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, BehaviorSubject, filter, switchMap } from 'rxjs';

import type { Id } from '../../../../../../../shared/types';
import { UserService } from '../../../../../../../shared/services';
import { ConfirmationDialogComponent } from '../../../../../../../shared/dialogs';
import { SubscriptionManagerComponent } from '../../../../../../../shared/abstract';
import { CardVote } from '../types';

@Component({
    selector: 'cc-request-card',
    templateUrl: './request-card.component.html',
    styleUrls: ['./request-card.component.scss'],
    standalone: false
})
export class RequestCardComponent extends SubscriptionManagerComponent {
	@Output()
	public onAccept: EventEmitter<void> = new EventEmitter<void>();
	@Output()
	public onDecline: EventEmitter<void> = new EventEmitter<void>();

	@Output()
	public onVote: EventEmitter<CardVote> = new EventEmitter<CardVote>();

  public readonly CardVote: typeof CardVote = CardVote;

	public readonly isAdmin$: Observable<boolean>;
	public readonly userId$: Observable<Id>;
	public readonly collectorId$: Observable<Id>;
	public readonly votes$: Observable<number>;
	public readonly vote$: Observable<CardVote>;

	private readonly userIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
	private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
	private readonly votesSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
	private readonly voteSubject: BehaviorSubject<CardVote | null> = new BehaviorSubject<CardVote | null>(null);

	@Input()
	public set collectorId(id: Id) {
		this.collectorIdSubject.next(id);
	}
	public get collectorId(): Id {
		const collectorId = this.collectorIdSubject.getValue();
		if(collectorId == null) throw new Error("collectorId not set");
		return collectorId;
	}

	@Input()
	public set userId(id: Id | null | undefined) {
		if(id == null) return;
		this.userIdSubject.next(id);
	}
	public get userId(): Id {
		const userId = this.userIdSubject.getValue();
		if(userId == null) throw new Error("userId not set");
		return userId;
	}

	@Input()
	public set votes(votes: number | null | undefined) {
		if(votes == null) return;
		this.votesSubject.next(votes);
	}
	public get votes(): number {
		const votes = this.votesSubject.getValue();
		if(votes == null) throw new Error("votes not set");
		return votes;
	}

	@Input()
	public set vote(vote: CardVote | null | undefined) {
		if(vote == null) return;
		this.voteSubject.next(vote);
	}
	public get vote(): CardVote {
		const vote = this.voteSubject.getValue();
		if(vote == null) throw new Error("vote not set");
		return vote;
	}

	@Input()
	public title: string = "UNSET";

	constructor(
		private readonly userService: UserService,
		private readonly matDialog: MatDialog
	) {
		super();

		this.userId$ = this.userIdSubject.asObservable().pipe(filter((userId): userId is Id => userId != null));
		this.collectorId$ = this.collectorIdSubject.asObservable().pipe(filter((collectorId): collectorId is Id => collectorId != null));

		this.isAdmin$ = this.collectorId$.pipe(
			switchMap(collectorId => this.userService.isCollectorAdmin(collectorId))
		);

		this.votes$ = this.votesSubject.asObservable().pipe(filter((votes): votes is number => votes != null));
		this.vote$ = this.voteSubject.asObservable().pipe(filter((vote): vote is CardVote => vote != null));
	}

	public accept(): void {
		this.registerSubscription(ConfirmationDialogComponent.open(this.matDialog, "Accept request?").pipe(
			filter(confirm => confirm === true),
		).subscribe(() => {
			this.onAccept.next();
		}));
	}

	public decline(): void {
		this.registerSubscription(ConfirmationDialogComponent.open(this.matDialog, "Decline request?").pipe(
			filter(confirm => confirm === true),
		).subscribe(() => {
			this.onDecline.next();
		}));
	}

	public upvote(currentVote: CardVote): void {
    this.onVote.emit(currentVote == CardVote.Upvote ? CardVote.Neutral : CardVote.Upvote);
  }

	public downvote(currentVote: CardVote): void {
    this.onVote.emit(currentVote == CardVote.Downvote ? CardVote.Neutral : CardVote.Downvote);
  }
}
