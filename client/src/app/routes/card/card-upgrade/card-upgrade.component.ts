import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, map, filter, switchMap, combineLatest as observableCombibeLatest, share } from 'rxjs';
import type { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { CardUpgradeService } from './card-upgrade.service';
import type { UnlockedCard, InventoryResponse } from '../../../shared/types';
import { CardService } from '../../../shared/components';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import { ConfirmationDialogComponent } from '../../../shared/dialogs';

@Component({
    selector: "cc-card-upgrade",
    templateUrl: "./card-upgrade.component.html",
    styleUrls: ["./card-upgrade.component.scss"],
    standalone: false
})
export class CardUpgradeComponent extends SubscriptionManagerComponent {
	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public readonly unlockedCard$: Observable<UnlockedCard>;
  public readonly unlockedCardsResponse$: Observable<InventoryResponse>;

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
      switchMap(cardId => this.cardService.getUnlockedCard(cardId))
		);
    this.unlockedCardsResponse$ = observableCombibeLatest([this.unlockedCard$, this.pageSubject.asObservable()]).pipe(
      switchMap(([unlockedCard, page]) => this.cardUpgradeService.getUpgradeCards(unlockedCard.userId, unlockedCard.card.collectorId, page, unlockedCard.level, [unlockedCard.id], unlockedCard.card.cardInfo.id)),
      share(),
    );
  }

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}

  public onClick(cardOne: UnlockedCard, cardTwo: UnlockedCard): void {
    this.registerSubscription(ConfirmationDialogComponent.open(this.matDialog, "Attempt Card Upgrade?").pipe(
      filter(confirm => confirm === true),
      switchMap(() => this.cardUpgradeService.upgrade(cardOne.id, cardTwo.id))
    ).subscribe(({ card }) => {
      //TODO: upgade effect, use success
      this.router.navigate(["card", card], { queryParams: { unlocked: true } });
    }));
  }
}
