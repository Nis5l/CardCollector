import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, map, switchMap, of as observableOf, catchError } from 'rxjs';

import type { Card } from '../../../shared/types';
import { CardService } from '../../../shared/components';
import { NavigationService } from '../../../shared/services';

@Component({
    selector: 'cc-card-view',
    templateUrl: "./card-view.component.html",
    styleUrls: ["./card-view.component.scss"],
    standalone: false
})
export class CardViewComponent {
	public readonly card$: Observable<Card | null>;

	private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public readonly loading$: Observable<boolean>;

	public constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly cardService: CardService,
    private readonly navigationService: NavigationService
  ) {
		const cardId$ = this.activatedRoute.params.pipe(
			map(params => {
				const cardId: unknown = params["cardId"] as unknown;
				if(typeof cardId !== "string") throw new Error("cardId not set");
				return cardId;
			})
		);

		this.loading$ = this.loadingSubject.asObservable();

    this.card$ = cardId$.pipe(
      tap(() => {
        this.loadingSubject.next(true);
      }),
      switchMap(cardId => this.cardService.getCard(cardId).pipe(
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
