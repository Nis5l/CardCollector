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

  //TODO: not working rn, cant sort client side
  /* public readonly sortTypes: { text: string, value: { card: CardSortType, cardType: CardTypeSortType } }[] = [
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

  public readonly formGroup; */

  constructor(
    private readonly cardService: CardService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly matDialog: MatDialog,
  ){
    super();

    /* const defaultSortType = this.sortTypes[0].value;
    const sortTypeFormControl = new FormControl(defaultSortType, { nonNullable: true });

    this.formGroup = new FormGroup({
      sortType: sortTypeFormControl
    }); */

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
      //sortTypeFormControl.valueChanges.pipe(startWith(defaultSortType)),
      this.reloadSubject.asObservable().pipe(startWith(0)),
    ]).pipe(
      tap(() => this.loadingSubject.next(true)),
      switchMap(([id, page]) => forkJoin([
        this.cardService.getCardTypes(id, "", page, CardState.Requested, CardTypeSortType.Recent),
        this.cardService.getCardTypes(id, "", page, CardState.Delete, CardTypeSortType.Recent),
        this.cardService.getCards(id, "", page, CardState.Requested, CardSortType.Recent),
        this.cardService.getCards(id, "", page, CardState.Delete, CardSortType.Recent)
      ])),
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
          page: reqCardType.page, //NOTE: should always match, if not throw error or display something atleast? I guess best would be displaying something and important log... TODO
          count: reqCardType.cardTypeCount + delCardType.cardTypeCount + reqCard.cardCount + delCard.cardCount,
          pageSize: reqCardType.pageSize + delCardType.pageSize + reqCard.pageSize + delCard.pageSize,
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
