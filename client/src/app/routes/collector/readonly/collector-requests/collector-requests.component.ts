import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { switchMap, map, combineLatest as observableCombineLatest, tap, Observable, BehaviorSubject, ReplaySubject, Subject, shareReplay, forkJoin, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';

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
  hasMore: boolean,
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
    hasMore: false,
    requests: []
  };
  private readonly combinedRequestIndexSubject: BehaviorSubject<CombinedRequestIndex> = new BehaviorSubject(this.defaultCombinedRequestIndex);
  public readonly combinedRequestIndex$: Observable<CombinedRequestIndex>;

  public readonly sortTypes: { text: string, value: { card: CardSortType, cardType: CardTypeSortType } }[] = [
    {
      text: "Recent",
      value: {
        card: CardSortType.Recent,
        cardType: CardTypeSortType.Recent,
      }
    },
    {
      text: "Votes",
      value: {
        card: CardSortType.Votes,
        cardType: CardTypeSortType.Votes,
      }
    },
  ];

  public readonly formGroup;

  constructor(
    private readonly cardService: CardService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly matDialog: MatDialog,
  ){
    super();

    const defaultSortType = this.sortTypes[0].value;
    const sortTypeFormControl = new FormControl(defaultSortType, { nonNullable: true });

    this.formGroup = new FormGroup({
      sortType: sortTypeFormControl
    });

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

    const combinedRequests$ = observableCombineLatest([
      this.collectorId$,
      this.pageSubject.asObservable(),
      sortTypeFormControl.valueChanges.pipe(startWith(defaultSortType)),
      this.reloadSubject.asObservable().pipe(startWith(0)),
    ]).pipe(
      tap(() => this.loadingSubject.next(true)),
      switchMap(([id, page, sort_type]) => forkJoin([
          this.cardService.getCardTypes(id, "", page, CardState.Requested, sort_type.cardType),
          this.cardService.getCardTypes(id, "", page, CardState.Delete, sort_type.cardType),
          this.cardService.getCards(id, "", page, CardState.Requested, sort_type.card),
          this.cardService.getCards(id, "", page, CardState.Delete, sort_type.card)
        ]).pipe(
          map(([reqCardType, delCardType, reqCard, delCard]) => {
            const requests: CombinedRequest[] = [
              ...[...reqCardType.cardTypes, ...delCardType.cardTypes].map(ct => ({
                kind: 'cardType' as const,
                data: ct
              })),
              ...[...reqCard.cards, ...delCard.cards].map(c => ({
                kind: 'card' as const,
                data: c
              }))
            ].sort((a, b) => {
              if(sort_type.card == CardSortType.Recent && sort_type.cardType == CardTypeSortType.Recent) {
                const aTime =
                  a.kind === 'cardType'
                    ? new Date(a.data.time).getTime()
                    : new Date(a.data.cardInfo.time).getTime();

                const bTime =
                  b.kind === 'cardType'
                    ? new Date(b.data.time).getTime()
                    : new Date(b.data.cardInfo.time).getTime();

                return bTime - aTime;
              }

              if(sort_type.card == CardSortType.Votes && sort_type.cardType == CardTypeSortType.Votes) {
                if(a.data.votes == null || b.data.votes == null) throw new Error("votes not set");
                return b.data.votes - a.data.votes;
              }

              throw new Error("Invalid sort type");
            });

            const hasMore =
              (reqCardType.page * reqCardType.pageSize + reqCardType.cardTypes.length) < reqCardType.cardTypeCount ||
              (delCardType.page * delCardType.pageSize + delCardType.cardTypes.length) < delCardType.cardTypeCount ||
              (reqCard.page * reqCard.pageSize + reqCard.cards.length) < reqCard.cardCount ||
              (delCard.page * delCard.pageSize + delCard.cards.length) < delCard.cardCount;

            return {
              page: reqCardType.page, //NOTE: should always match, if not throw error or display something atleast? I guess best would be displaying something and important log... TODO
              count: reqCardType.cardTypeCount + delCardType.cardTypeCount + reqCard.cardCount + delCard.cardCount,
              pageSize: reqCardType.pageSize + delCardType.pageSize + reqCard.pageSize + delCard.pageSize, //TODO: find better paging fix
              hasMore,
              requests
            };
          })
        ),
      ),
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
