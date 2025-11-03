import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable, map, tap, filter, switchMap, combineLatest as observableCombineLatest, share, catchError, of as observableOf } from 'rxjs';

import { TradeFriendInventoryService } from './trade-friend-inventory.service';
import type { Id } from '../../../../../../shared/types';
import { AuthService, LoadingService } from '../../../../../../shared/services';
import { ConfirmationDialogComponent } from '../../../../../../shared/dialogs';
import { SubscriptionManagerComponent } from '../../../../../../shared/abstract';
import { TradeService } from '../../trade.service';
import type { TradeInfoResponse } from '../../types';

@Component({
  selector: "cc-trade-friend-inventory",
  templateUrl: "./trade-friend-inventory.component.html",
  styleUrls: [  "././trade-friend-inventory.component.scss" ]
})
export class TradeFriendInventoryComponent extends SubscriptionManagerComponent {
  public readonly userId$: Observable<Id>;
  public readonly collectorId$: Observable<Id>;
  public readonly excludeUuids$: Observable<Id[]>;

  constructor(
    private readonly tradeFriendInventoryService: TradeFriendInventoryService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly matDialog: MatDialog,
    private readonly loadingService: LoadingService,
    tradeService: TradeService,
    authService: AuthService,
  ) {
    super();
    const params$ = this.activatedRoute.parent?.parent?.params ?? this.activatedRoute.params;

    this.userId$ = params$.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId param not set");
        return userId;
      }),
    );

    this.collectorId$ = params$.pipe(
      map(params => {
        const collectorId: unknown = params["collectorId"];
        if(typeof collectorId !== "string") throw new Error("collectorId param not set");
        return collectorId;
      }),
    );

    //TODO: make more specific, too much data
    const tradeInfo$: Observable<TradeInfoResponse> = observableCombineLatest([this.userId$, this.collectorId$]).pipe(
      switchMap(([userId, collectorId]) => tradeService.getTradeinfo(userId, collectorId)),
      share()
    );

    this.excludeUuids$ = tradeInfo$.pipe(
      map(({ friendCards, selfCardSuggestions }) => [...friendCards, ...selfCardSuggestions].map(({ id }) => id))
    );
  }

  public addSuggestion(cardId: Id): void {
    this.registerSubscription(ConfirmationDialogComponent.open(this.matDialog, "Add Suggestion?").pipe(
      filter(confirm => confirm === true),
      tap(() => this.loadingService.setLoading(true)),
      switchMap(() => observableCombineLatest([this.userId$, this.collectorId$])),
      switchMap(([userId, collectorId]) => this.tradeFriendInventoryService.addSuggestion(userId, collectorId, cardId).pipe(catchError(() => observableOf(null)))),
      tap(() => this.loadingService.setLoading(false)),
    ).subscribe(() => {
      this.router.navigate([".."], { relativeTo: this.activatedRoute });
    }));
  }

  public closeSuggestion(): void {
    this.router.navigate([".."], { relativeTo: this.activatedRoute });
  }
}
