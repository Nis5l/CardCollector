import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, tap, map, switchMap, catchError, of as observableOf } from 'rxjs';

import type { UnlockedCard } from '../../../shared/types';
import { CardService } from '../../../shared/components';

@Component({
    selector: 'cc-card-unlock-view',
    templateUrl: "./card-unlock-view.component.html",
    styleUrls: ["./card-unlock-view.component.scss"],
    standalone: false
})
export class CardUnlockViewComponent {
	public readonly unlockedCard$: Observable<UnlockedCard | null>;

	private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public readonly loading$: Observable<boolean>;

	public constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly cardService: CardService,
  ) {
		const cardId$ = this.activatedRoute.params.pipe(
			map(params => {
				const cardId: unknown = params["cardId"] as unknown;
				if(typeof cardId !== "string") throw new Error("cardId not set");
				return cardId;
			})
		);

		this.loading$ = this.loadingSubject.asObservable();

		this.unlockedCard$ = cardId$.pipe(
      tap(() => {
        this.loadingSubject.next(true);
      }),
      switchMap(cardId => this.cardService.getUnlockedCard(cardId).pipe(
        catchError(() => observableOf(null))
      )),
      tap(() => {
        this.loadingSubject.next(false);
      }),
    );
	}
}
