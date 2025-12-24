import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { switchMap, map, combineLatest as observableCombineLatest, Observable, BehaviorSubject, ReplaySubject, Subject, share, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { CollectorService } from '../../shared';
import { CollectorAddDialogComponent } from '../collector-add-dialog';

import type { Id, CardIndexResponse, CardTypeIndexResponse } from '../../../../shared/types';
import { CardSortType, CardTypeSortType, CardState } from '../../../../shared/types';
import { CardService } from '../../../../shared/services';
import type { PageEvent } from '@angular/material/paginator';

@Component({
    selector: "cc-collector-requests",
    templateUrl: "./collector-requests.component.html",
    styleUrls: ["./collector-requests.component.scss"],
    standalone: false
})
export class CollectorRequestsComponent extends SubscriptionManagerComponent {
  public readonly collectorId$: Observable<Id>;
  public readonly loading$: Observable<unknown>;

  private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly reloadSubject: Subject<void> = new Subject();
  private readonly cardTypeIndexSubject: ReplaySubject<CardTypeIndexResponse> = new ReplaySubject<CardTypeIndexResponse>(1);
  public readonly cardTypeIndex$: Observable<CardTypeIndexResponse>;
  private readonly cardIndexSubject: ReplaySubject<CardIndexResponse> = new ReplaySubject<CardIndexResponse>(1);
  public readonly cardIndex$: Observable<CardIndexResponse>;

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

    const cardTypes$: Observable<CardTypeIndexResponse> = observableCombineLatest([this.collectorId$, this.pageSubject.asObservable(), this.reloadSubject.asObservable()]).pipe(
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
      share()
    );

    const cards$ = observableCombineLatest([this.collectorId$, this.pageSubject.asObservable(), this.reloadSubject.asObservable()]).pipe(
      switchMap(([id, page]) => this.cardService.getCards(id, "", page, CardState.Requested, CardSortType.Recent)),
      share()
    );
    this.loading$ = observableCombineLatest([cardTypes$, cards$]).pipe();
    this.registerSubscription(cardTypes$.subscribe(cardTypeIndex => this.cardTypeIndexSubject.next(cardTypeIndex)));
    this.registerSubscription(cards$.subscribe(cardIndex => this.cardIndexSubject.next(cardIndex)));

    this.cardTypeIndex$ = this.cardTypeIndexSubject.asObservable();
    this.cardIndex$ = this.cardIndexSubject.asObservable();
    this.reload();
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
	}

  public changePage(page: PageEvent): void {
    this.pageSubject.next(page.pageIndex);
  }
}
