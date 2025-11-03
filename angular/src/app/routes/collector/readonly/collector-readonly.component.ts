import { Component } from '@angular/core';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import type { PageEvent } from '@angular/material/paginator';
import { switchMap, map, Observable, combineLatest as observableCombineLatest, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

import { CollectorService } from '../collector.service';
import { CollectorReadonlyService } from './collector-readonly.service';
import { LoadingService, AuthService } from '../../../shared/services';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import type { Collector, Id } from '../../../shared/types';
import type { CardTypeIndexResponse } from './types';
import { type NavigationItem } from '../../../shared/components';

import { CollectorAddDialogComponent } from './collector-add-dialog';

import { CollectorDashboardComponent } from './collector-dashboard';
import { CollectorRequestsComponent } from './collector-requests';
import { CollectorInventoryComponent } from './collector-inventory';

const ROUTES: Route[] = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  { path: "dashboard", component: CollectorDashboardComponent },
  { path: "requests", component: CollectorRequestsComponent },
  { path: ":userId/inventory", component: CollectorInventoryComponent },
];

@Component({
	selector: "cc-collector-readonly",
	templateUrl: "./collector-readonly.component.html",
	styleUrls: [ "./collector-readonly.component.scss" ]
})
export class CollectorReadonlyComponent extends SubscriptionManagerComponent {
	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

	public readonly collector$: Observable<Collector>;
	public readonly canEdit$: Observable<boolean>;

	private readonly reloadCardTypesSubject: Subject<void> = new Subject();
	public readonly cardTypeIndexSubject: ReplaySubject<CardTypeIndexResponse> = new ReplaySubject<CardTypeIndexResponse>(1);
	public readonly cardTypeIndex$: Observable<CardTypeIndexResponse>;

  public readonly navigationItems: NavigationItem[] = [
    { name: "Dashboard", link: "./dashboard", icon: "home" },
    { name: "Requests", link: "./requests", icon: "list_alt" },
    { name: "Inventory", link: () => `./${this.authService.getUserId()}/inventory`, icon: "backpack" },
  ];

	constructor(
		private readonly router: Router,
		private readonly collectorService: CollectorService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly authService: AuthService,
		private readonly matDialog: MatDialog,
		private readonly collectorReadonlyService: CollectorReadonlyService,
		private readonly loadingService: LoadingService
	) {
		super();
		this.collector$ = loadingService.waitFor(activatedRoute.params.pipe(
			switchMap(params => {
				const collectorId = params["collectorId"] as unknown;
				if(typeof collectorId !== "string") {
					throw new Error("collectorId is not a string");
				}

				return this.collectorService.getCollector(collectorId);
			})
		));

		this.canEdit$ = observableCombineLatest([this.collector$, this.authService.authData()]).pipe(
			map(([collector, authData]) => AuthService.userIdEqual(collector.userId, authData?.userId))
		);

		this.registerSubscription(this.loadingService.waitFor(
			observableCombineLatest([this.collector$, this.pageSubject.asObservable(), this.reloadCardTypesSubject.asObservable()]).pipe(
				switchMap(([{ id }, page]) => this.collectorReadonlyService.indexRequestedCardTypes(id, "", page))
			)
		)
		.subscribe(cardTypeIndex => this.cardTypeIndexSubject.next(cardTypeIndex)));

		this.cardTypeIndex$ = this.cardTypeIndexSubject.asObservable();
		this.reloadCardTypes();
	}

	public edit(): void {
		this.router.navigate(["edit"], { relativeTo: this.activatedRoute });
	}

	public openAddDialog(collectorId: Id): void {
		CollectorAddDialogComponent.open(this.matDialog, collectorId);
	}

	public reloadCardTypes(): void {
		this.reloadCardTypesSubject.next();
	}

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}

  public static getRoutes(){
    return ROUTES;
  }
}
