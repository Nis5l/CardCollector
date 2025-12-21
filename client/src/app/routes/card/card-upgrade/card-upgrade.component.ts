import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, catchError, map, filter, switchMap, combineLatest as observableCombibeLatest, shareReplay, tap, of as observableOf } from 'rxjs';
import type { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { CardUpgradeService } from './card-upgrade.service';
import type { UnlockedCard, Id } from '../../../shared/types';
import { CardService } from '../../../shared/services';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import { YesNoCancelDialogComponent } from '../../../shared/dialogs';

@Component({
    selector: "cc-card-upgrade",
    templateUrl: "./card-upgrade.component.html",
    styleUrls: ["./card-upgrade.component.scss"],
    standalone: false
})
export class CardUpgradeComponent extends SubscriptionManagerComponent {
	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public readonly unlockedCard$: Observable<UnlockedCard | null>;

	private readonly cardLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public readonly cardLoading$: Observable<boolean>;

  constructor(
    private readonly cardUpgradeService: CardUpgradeService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly cardService: CardService,
    private readonly matDialog: MatDialog,
  ) {
    super();
		this.unlockedCard$ = this.activatedRoute.params.pipe(
			map(params => {
				const cardId: unknown = params["cardId"] as unknown;
				if(typeof cardId !== "string") throw new Error("cardId not set");
				return cardId;
			}),
      tap(() => this.cardLoadingSubject.next(true)),
      switchMap(cardId => this.cardService.getUnlockedCard(cardId).pipe(
        catchError(() => observableOf(null))
      )),
      tap(() => this.cardLoadingSubject.next(false)),
      shareReplay(1),
		);

		this.cardLoading$ = this.cardLoadingSubject.asObservable();
  }

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}

  public onClick(cardOne: UnlockedCard, cardTwo: Id): void {
    this.registerSubscription(YesNoCancelDialogComponent.open(this.matDialog, "Attempt Card Upgrade?").pipe(
      filter(confirm => confirm === true),
      switchMap(() => this.cardUpgradeService.upgrade(cardOne.id, cardTwo))
    ).subscribe(({ card }) => {
      //TODO: upgade effect, use success
      this.router.navigate(["card", "unlocked", card]);
    }));
  }
}
