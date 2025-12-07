import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, combineLatest as observableCombineLatest } from 'rxjs';

import type { CardOrUnlockedCardId } from '../../../shared/types';

@Component({
    selector: 'cc-card-view',
    templateUrl: "./card-view.component.html",
    styleUrls: ["./card-view.component.scss"],
    standalone: false
})
export class CardViewComponent {
	public readonly cardOrUnlockedCardId$: Observable<CardOrUnlockedCardId>;

	public constructor(private readonly activatedRoute: ActivatedRoute) {
		const cardId$ = this.activatedRoute.params.pipe(
			map(params => {
				const cardId: unknown = params["cardId"] as unknown;
				if(typeof cardId !== "string") throw new Error("cardId not set");
				return cardId;
			})
		);
    const unlocked$ = this.activatedRoute.queryParams.pipe(
      map(params => params["unlocked"] === "true")
    );

		this.cardOrUnlockedCardId$ = observableCombineLatest([cardId$, unlocked$]).pipe(
      map(([cardId, unlocked]) => ({ id: cardId, unlocked: unlocked })),
    );
	}
}
