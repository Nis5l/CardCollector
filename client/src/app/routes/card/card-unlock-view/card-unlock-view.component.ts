import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, tap, map, switchMap, catchError, of as observableOf } from 'rxjs';

import type { UnlockedCard } from '../../../shared/types';
import { CardService } from '../../../shared/services';
import { NavigationService } from '../../../shared/services';

@Component({
    selector: 'cc-card-unlock-view',
    templateUrl: "./card-unlock-view.component.html",
    styleUrls: ["./card-unlock-view.component.scss"],
    standalone: false
})
export class CardUnlockViewComponent {
	public readonly unlockedCard$: Observable<UnlockedCard | null>;
	public readonly turn$: Observable<boolean>;

	private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public readonly loading$: Observable<boolean>;

	public constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly cardService: CardService,
    private readonly navigationService: NavigationService,
  ) {
		const cardId$ = this.activatedRoute.params.pipe(
			map(params => {
				const cardId: unknown = params["cardId"] as unknown;
				if(typeof cardId !== "string") throw new Error("cardId not set");
				return cardId;
			})
		);

		this.turn$ = this.activatedRoute.queryParams.pipe(
			map(params => {
				const turn: unknown = params["turn"] as unknown;
				return turn != null;
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

  public goBack(): void {
    this.navigationService.goBack();
  }

  public canGoBack(): boolean {
    return this.navigationService.canGoBack();
  }
}
