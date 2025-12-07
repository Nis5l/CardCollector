import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, map, combineLatest as observableCombineLatest } from 'rxjs';

import { CollectorFavoritesService } from './collector-favorites.service';
import { LoadingService, AuthService } from '../../../../shared/services';
import type { Collector, Id } from '../../../../shared/types';

@Component({
    selector: "cc-collector-favorites",
    templateUrl: "./collector-favorites.component.html",
    styleUrls: ["./collector-favorites.component.scss"],
    standalone: false
})
export class CollectorFavoritesComponent {
	public readonly favoriteCollectors$: Observable<Collector[]>;
  public readonly tradeId$: Observable<Id | null>;

  constructor(
    private readonly collectorFavoritesService: CollectorFavoritesService,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    loadingService: LoadingService,
  ) {
    const params$ = activatedRoute.parent?.params ?? activatedRoute.params;
    const userId$ = params$.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId param not set");
        return userId;
      }),
    );

    this.favoriteCollectors$ = loadingService.waitFor(userId$.pipe(
      switchMap(userId => this.collectorFavoritesService.favoriteCollectors(userId))
    ));

    this.tradeId$ = observableCombineLatest([authService.authData(), userId$]).pipe(
      map(([authData, userId]) => authData?.userId === userId ? null : userId)
    );
  }

}
