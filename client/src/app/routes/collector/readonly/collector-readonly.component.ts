import { Component } from '@angular/core';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { switchMap, map, Observable, combineLatest as observableCombineLatest } from 'rxjs';

import { CollectorService } from '../shared';
import { LoadingService, AuthService } from '../../../shared/services';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import type { Collector } from '../../../shared/types';
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
	public readonly collector$: Observable<Collector>;
	public readonly canEdit$: Observable<boolean>;
	public readonly moderators$: Observable<User[]>;

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
		private readonly loadingService: LoadingService
	) {
		super();
		this.collector$ = this.loadingService.waitFor(activatedRoute.params.pipe(
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

  public static getRoutes(){
    return ROUTES;
  }
}
