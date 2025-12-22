import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';

import type { Id } from '../../../../shared/types';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';

@Component({
    selector: "cc-collector-catalog",
    templateUrl: "./collector-catalog.component.html",
    styleUrls: ["./collector-catalog.component.scss"],
    standalone: false
})
export class CollectorCatalogComponent extends SubscriptionManagerComponent {
  public readonly collectorId$: Observable<Id>;

  constructor(activatedRoute: ActivatedRoute) {
    super();
    const params$ = activatedRoute.parent?.params ?? activatedRoute.params;

    this.collectorId$ = params$.pipe(
      map(params => {
        const collectorId: unknown = params["collectorId"];
        if(typeof collectorId !== "string") throw new Error("collectorId param not set");
        return collectorId;
      }),
    );
  }
}
