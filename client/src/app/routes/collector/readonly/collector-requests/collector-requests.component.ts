import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { switchMap, map, combineLatest as observableCombineLatest, tap, Observable, BehaviorSubject, ReplaySubject, Subject, shareReplay, forkJoin, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { CollectorService } from '../../shared';
import { CollectorAddDialogComponent } from '../collector-add-dialog';

import type { Id, CardIndexResponse, CardTypeIndexResponse, Card, CardType } from '../../../../shared/types';
import { CardSortType, CardTypeSortType, CardState } from '../../../../shared/types';
import { CardService } from '../../../../shared/services';
import type { PageEvent } from '@angular/material/paginator';

type CombinedRequest = { kind: 'card', data: Card } | { kind: 'cardType', data: CardType };

interface CombinedRequestIndex {
  pageSize: number,
  page: number,
  count: number,
  requests: CombinedRequest[]
}

@Component({
    selector: "cc-collector-requests",
    templateUrl: "./collector-requests.component.html",
    styleUrls: ["./collector-requests.component.scss"],
    standalone: false
})
export class CollectorRequestsComponent extends SubscriptionManagerComponent {
  public readonly collectorId$: Observable<Id>;
  public readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean>;

  private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly reloadSubject: Subject<void> = new Subject();
  private readonly defaultCombinedRequestIndex: CombinedRequestIndex = {
    count: 0,
    page: 0,
    pageSize: 0,
    requests: []
  };
  private readonly combinedRequestIndexSubject: BehaviorSubject<CombinedRequestIndex> = new BehaviorSubject(this.defaultCombinedRequestIndex);
  public readonly combinedRequestIndex$: Observable<CombinedRequestIndex>;

  constructor(
    private readonly cardService: CardService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly matDialog: MatDialog,
  ){
    super();

    const params$ = this.activatedRoute.parent?.params ?? this.activatedRoute.params;

    this.collectorId$ = params$.pipe(
      map(params => {
        const collectorId = params["collectorId"] as unknown;
        if(typeof collectorId !== "string") {
          throw new Error("collectorId is not a string");
        }

        return collectorId;
      })
    );

    const cardTypes$: Observable<CardTypeIndexResponse> = observableCombineLatest([this.collectorId$, this.pageSubject.asObservable(), this.reloadSubject.asObservable().pipe(startWith(0))]).pipe(
      tap(() => this.loadingSubject.next(true)),
      switchMap(([id, page]) => forkJoin([
        this.cardService.getCardTypes(id, "", page, CardState.Requested, CardTypeSortType.Recent),
        this.cardService.getCardTypes(id, "", page, CardState.Delete, CardTypeSortType.Recent)
        ]).pipe(
          map(([requested, deleted]) => ({
            pageSize: requested.page + deleted.pageSize,
            page: requested.page,
            cardTypeCount: requested.cardTypeCount + deleted.cardTypeCount,
            cardTypes: [ ...requested.cardTypes, ...deleted.cardTypes ]
          }))
      )),
      shareReplay(1)
    );

    const cards$: Observable<CardIndexResponse> = observableCombineLatest([this.collectorId$, this.pageSubject.asObservable(), this.reloadSubject.asObservable().pipe(startWith(0))]).pipe(
      tap(() => this.loadingSubject.next(true)),
      switchMap(([id, page]) => forkJoin([
        this.cardService.getCards(id, "", page, CardState.Requested, CardSortType.Recent),
        this.cardService.getCards(id, "", page, CardState.Delete, CardSortType.Recent)
    ]).pipe(
        map(([requested, deleted]) => ({
          pageSize: requested.page + deleted.pageSize,
          page: requested.page,
          cardCount: requested.cardCount + deleted.cardCount,
          cards: [ ...requested.cards, ...deleted.cards ]
        }))
    )),
      shareReplay(1)
    );

    const combinedRequests$ = observableCombineLatest([
      cardTypes$,
      cards$
    ]).pipe(
      map(([cardTypeRes, cardRes]) => {
        const requests: CombinedRequest[] = [
          ...cardTypeRes.cardTypes.map(ct => ({
            kind: 'cardType' as const,
            data: ct
          })),
          ...cardRes.cards.map(c => ({
            kind: 'card' as const,
            data: c
          }))
        ].sort((a, b) => {
          const aTime =
            a.kind === 'cardType'
              ? new Date(a.data.time).getTime()
              : new Date(a.data.cardInfo.time).getTime();

          const bTime =
            b.kind === 'cardType'
              ? new Date(b.data.time).getTime()
              : new Date(b.data.cardInfo.time).getTime();

          return bTime - aTime; // recent DESC
        });

        return {
          page: cardRes.page, //NOTE: should always match, if not throw error or display something atleast? I guess best would be displaying something and important log... TODO
          count: cardRes.cardCount + cardTypeRes.cardTypeCount,
          pageSize: cardRes.pageSize + cardTypeRes.pageSize,
          requests
        };
      }),
      tap(() => this.loadingSubject.next(false)),
      shareReplay(1)
    );

    this.loading$ = this.loadingSubject.asObservable();

    this.registerSubscription(combinedRequests$.subscribe(combinedRequests => this.combinedRequestIndexSubject.next(combinedRequests)));
    this.combinedRequestIndex$ = this.combinedRequestIndexSubject.asObservable();
  }

	public openAddDialog(collectorId: Id): void {
		this.registerSubscription(CollectorAddDialogComponent.open(this.matDialog, collectorId).subscribe(
      result => {
        if(result == "refresh") this.reloadSubject.next();
      }
    ));
	}

	public reload(): void {
		this.reloadSubject.next();
    this.combinedRequestIndexSubject.next(this.defaultCombinedRequestIndex);
	}

  public changePage(page: PageEvent): void {
    this.pageSubject.next(page.pageIndex);
  }
}
