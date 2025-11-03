import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable, map, switchMap, share, combineLatest as observableCombineLatest, of as observableOf, Subject, startWith, filter, tap } from 'rxjs';

import { TradeService } from '../../trade.service';
import type { TradeInfoResponse } from '../../types';
import type { Id, UnlockedCard } from '../../../../../../shared/types';
import { ConfirmationDialogComponent, YesNoCancelDialogComponent } from '../../../../../../shared/dialogs';
import { LoadingService } from '../../../../../../shared/services';
import { TradeStatus } from '../../types/trade-status.enum';

@Component({
  selector: "cc-trade-self-trade",
  templateUrl: "./trade-self-trade.component.html",
  styleUrls: [  "././trade-self-trade.component.scss" ]
})
export class TradeSelfTradeComponent {
  //TODO: split for self and friend
  public readonly tradeInfo$: Observable<TradeInfoResponse>;
  public readonly disableAdd$: Observable<boolean>;
  public readonly confirmed$: Observable<boolean>;
  private readonly reloadCards: Subject<void> = new Subject<void>();
  private readonly userId$: Observable<Id>;
  private readonly collectorId$: Observable<Id>;

  constructor(
    private readonly tradeService: TradeService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly matDialog: MatDialog,
    private readonly loadingService: LoadingService
  ) {
    const params$ = activatedRoute.parent?.parent?.params ?? activatedRoute.params;

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

    this.tradeInfo$ = observableCombineLatest([this.userId$, this.collectorId$, this.reloadCards.pipe(startWith(undefined))]).pipe(
      switchMap(([userId, collectorId]) => this.tradeService.getTradeinfo(userId, collectorId)),
      share()
    );

    this.disableAdd$ = this.tradeInfo$.pipe(
      map(tradeInfo => tradeInfo.selfCards.length >= tradeInfo.tradeCardLimit),
      startWith(false),
    );

    this.confirmed$ = this.tradeInfo$.pipe(
      map(tradeInfo => tradeInfo.selfStatus === TradeStatus.Confirmed),
      startWith(false),
    );
  }

  public openAddCard(): void {
    this.router.navigate(["inventory"], { relativeTo: this.activatedRoute });
  }

  public removeCard({ id: cardId }: UnlockedCard): void {
    ConfirmationDialogComponent.open(this.matDialog, "Remove Card?").pipe(
      filter(confirm => confirm === true),
      tap(() => this.loadingService.setLoading(true)),
      switchMap(() => observableCombineLatest([this.userId$, this.collectorId$])),
      switchMap(([userId, collectorId]) => this.tradeService.removeCard(userId, collectorId, cardId)),
      tap(() => this.loadingService.setLoading(false)),
    ).subscribe(() => {
        this.reloadCards.next();
    });
  }

  public acceptSuggestion({ id: cardId }: UnlockedCard): void {
    YesNoCancelDialogComponent.open(this.matDialog, "Accept Suggestion?").pipe(
      filter(confirm => confirm != null),
      tap(() => this.loadingService.setLoading(true)),
      switchMap(confirm => observableCombineLatest([observableOf(confirm), this.userId$, this.collectorId$])),
      switchMap(([confirm, userId, collectorId]) => confirm === true ? this.tradeService.addCard(userId, collectorId, cardId) : this.tradeService.removeSuggestion(userId, collectorId, cardId)),
      tap(() => this.loadingService.setLoading(false)),
    ).subscribe(() => {
        this.reloadCards.next();
    });
  }

  public confirm(): void {
    ConfirmationDialogComponent.open(this.matDialog, "Confirm Trade?").pipe(
      filter(confirm => confirm === true),
      tap(() => this.loadingService.setLoading(true)),
      switchMap(() => observableCombineLatest([this.userId$, this.collectorId$])),
      switchMap(([userId, collectorId]) => this.tradeService.confirm(userId, collectorId)),
      tap(() => this.loadingService.setLoading(false)),
    ).subscribe(() => {
        this.reloadCards.next();
    });
  }
}
