import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';

import { Id } from '../../../../shared/types';

@Component({
    selector: "cc-collector-inventory",
    templateUrl: "./collector-inventory.component.html",
    styleUrls: ["./collector-inventory.component.scss"],
    standalone: false
})
export class CollectorInventoryComponent {
  public readonly userId$: Observable<Id>;
  public readonly collectorId$: Observable<Id>;

  constructor(activatedRoute: ActivatedRoute) {
    const params$ = activatedRoute.parent?.params ?? activatedRoute.params;
    this.userId$ = activatedRoute.params.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId undefined");
        return userId;
      })
    );

    this.collectorId$ = params$.pipe(
      map(params => {
        const collectorId: unknown = params["collectorId"];
        if(typeof collectorId !== "string") throw new Error("collectorId param not set");
        return collectorId;
      }),
    );
  }
}
