import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, combineLatest as observableCombineLatest, filter, Observable } from 'rxjs';

import { CollectorService } from '../collector.service';
import { LoadingService, AuthService } from '../../../shared/services';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import type { Collector, Id } from '../../../shared/types';

@Component({
    selector: "cc-collector-edit",
    templateUrl: "./collector-edit.component.html",
    styleUrls: ["./collector-edit.component.scss"],
    standalone: false
})
export class CollectorEditComponent extends SubscriptionManagerComponent {
	public readonly collector$: Observable<Collector | null>;
	
	constructor(
		private readonly collectorService: CollectorService,
		private readonly authService: AuthService,
		private readonly router: Router,
		activatedRoute: ActivatedRoute,
		loadingService: LoadingService
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

		this.registerSubscription(observableCombineLatest([this.collector$, this.authService.authData()]).pipe(
			filter(([collector, authData]) => !AuthService.userIdEqual(collector?.userId, authData?.userId))
		).subscribe(([collector]) => this.navigateCollector(collector?.id)));
	}

	public navigateCollector(collectorId: Id | undefined): void {
		if(collectorId == null) this.router.navigate(["home"]);
		this.router.navigate(["collector", collectorId]);
	}
}
