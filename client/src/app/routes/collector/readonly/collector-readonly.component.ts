import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import type { PageEvent } from '@angular/material/paginator';
import { switchMap, map, Observable, combineLatest as observableCombineLatest, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

import { CollectorService } from '../shared';
import { CollectorReadonlyService } from './collector-readonly.service';
import { LoadingService, AuthService } from '../../../shared/services';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import type { Collector } from '../../../shared/types';
import type { CardTypeIndexResponse } from '../types';
import { type NavigationItem } from '../../../shared/components';

import { CollectorDashboardComponent } from './collector-dashboard';
import { CollectorRequestsComponent } from './collector-requests';
import { CollectorInventoryComponent } from './collector-inventory';
import { CollectorCatalogComponent } from './collector-catalog';

import { User } from 'src/app/shared/types/user';
const ROUTES: Route[] = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  { path: "dashboard", component: CollectorDashboardComponent },
  { path: "requests", component: CollectorRequestsComponent },
  { path: ":userId/inventory", component: CollectorInventoryComponent },
  { path: "catalog", component: CollectorCatalogComponent },
];

@Component({
    selector: "cc-collector-readonly",
    templateUrl: "./collector-readonly.component.html",
    styleUrls: ["./collector-readonly.component.scss"],
    standalone: false
})
export class CollectorReadonlyComponent extends SubscriptionManagerComponent {
	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

	public readonly collector$: Observable<Collector>;
	public readonly canEdit$: Observable<boolean>;
	public readonly moderators$: Observable<User[]>;

	private readonly reloadCardTypesSubject: Subject<void> = new Subject();
	public readonly cardTypeIndexSubject: ReplaySubject<CardTypeIndexResponse> = new ReplaySubject<CardTypeIndexResponse>(1);
	public readonly cardTypeIndex$: Observable<CardTypeIndexResponse>;

  public readonly navigationItems: NavigationItem[] = [
    { name: "Dashboard", link: "./dashboard", icon: "home" },
    { name: "Requests", link: "./requests", icon: "list_alt" },
    { name: "Inventory", link: () => `./${this.authService.getUserId()}/inventory`, icon: "backpack" },
    { name: "Catalog", link: "./catalog", icon: "book" },
  ];

  public showToggle = false;
  public descriptionExpanded = false;

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

    this.moderators$ = this.collector$.pipe(
      switchMap(({ id }) => this.collectorService.getModerators(id).pipe(
        map(({ moderators }) => moderators)
      ))
    );

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

  public onDescriptionChange(el: HTMLElement) {
    this.showToggle = el.scrollHeight > 100;

    if (!this.showToggle) {
      this.descriptionExpanded = true;
    } else {
      this.descriptionExpanded = false;
    }
  }

	public edit(): void {
		this.router.navigate(["edit"], { relativeTo: this.activatedRoute });
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
