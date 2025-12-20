import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, switchMap, catchError, of as observableOf } from 'rxjs';

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

		this.unlockedCard$ = cardId$.pipe(
      switchMap(cardId => this.cardService.getUnlockedCard(cardId).pipe(
        catchError(() => observableOf(null))
      ))
    );
	}
}
