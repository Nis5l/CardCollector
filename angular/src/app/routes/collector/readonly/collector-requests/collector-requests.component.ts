import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { switchMap, combineLatest as observableCombineLatest, Observable, BehaviorSubject, ReplaySubject, Subject, share } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { CollectorService } from '../../collector.service';
import { CollectorRequestsService } from './collector-requests.service';
import { CollectorAddDialogComponent } from '../collector-add-dialog';

import type { Collector, Id } from '../../../../shared/types';
import type { CardTypeIndexResponse, CardIndexResponse } from '../types';
import type { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';

@Component({
	selector: "cc-collector-requests",
	templateUrl: "./collector-requests.component.html",
	styleUrls: [ "./collector-requests.component.scss" ]
})
export class CollectorRequestsComponent extends SubscriptionManagerComponent {
  public readonly collector$: Observable<Collector>;
  public readonly loading$: Observable<unknown>;

  private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly reloadSubject: Subject<void> = new Subject();
  private readonly cardTypeIndexSubject: ReplaySubject<CardTypeIndexResponse> = new ReplaySubject<CardTypeIndexResponse>(1);
  public readonly cardTypeIndex$: Observable<CardTypeIndexResponse>;
  private readonly cardIndexSubject: ReplaySubject<CardIndexResponse> = new ReplaySubject<CardIndexResponse>(1);
  public readonly cardIndex$: Observable<CardIndexResponse>;

  constructor(
    private readonly collectorService: CollectorService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly matDialog: MatDialog,
    private readonly collectorRequestsService: CollectorRequestsService,
  ){
    super();
    const params$ = this.activatedRoute.parent?.params ?? this.activatedRoute.params;

    this.collector$ = params$.pipe(
		switchMap(params => {
			const collectorId = params["collectorId"] as unknown;
			if(typeof collectorId !== "string") {
				throw new Error("collectorId is not a string");
			}

			return this.collectorService.getCollector(collectorId);
		})
	);

	const cardTypes = observableCombineLatest([this.collector$, this.pageSubject.asObservable(), this.reloadSubject.asObservable()]).pipe(
		switchMap(([{id}, page]) => this.collectorRequestsService.indexRequestedCardTypes(id, "", page)),
		share()
	);

	const cards = observableCombineLatest([this.collector$, this.pageSubject.asObservable(), this.reloadSubject.asObservable()]).pipe(
		switchMap(([{id}, page]) => this.collectorRequestsService.indexRequestedCards(id, "", page)),
		share()
	);
	this.loading$ = observableCombineLatest([cardTypes, cards]).pipe();
    this.registerSubscription(cardTypes.subscribe(cardTypeIndex => this.cardTypeIndexSubject.next(cardTypeIndex)));
    this.registerSubscription(cards.subscribe(cardIndex => this.cardIndexSubject.next(cardIndex)));

    this.cardTypeIndex$ = this.cardTypeIndexSubject.asObservable();
    this.cardIndex$ = this.cardIndexSubject.asObservable();
    this.reload();
  }

	public openAddDialog(collectorId: Id): void {
		CollectorAddDialogComponent.open(this.matDialog, collectorId);
	}
	public reload(): void {
		this.reloadSubject.next();
	}

  public changePage(page: PageEvent): void {
    this.pageSubject.next(page.pageIndex);
  }
}
