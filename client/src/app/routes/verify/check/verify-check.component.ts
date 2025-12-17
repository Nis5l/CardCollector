import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, switchMap, shareReplay, of as observableOf, map, mapTo, filter, catchError, throwError as observableThrowError } from 'rxjs';

import { VerifyCheckService } from './verify-check.service';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import { LoadingService } from '../../../shared/services';

@Component({
    selector: 'cc-verify-check',
    templateUrl: './verify-check.component.html',
    styleUrls: ['./verify-check.component.scss'],
    standalone: false
})
export class VerifyCheckComponent extends SubscriptionManagerComponent {
  public readonly verified$: Observable<boolean>;

	constructor(
    private readonly verifyCheckService: VerifyCheckService,
    route: ActivatedRoute,
    router: Router,
    loadingService: LoadingService
  ) {
    super();

    const key$ = route.paramMap.pipe(
      map(params => params.get('key')),
      tap(key => {
        if (key == null) {
          console.error("somehow key not set");
          router.navigate(['/']);
        }
      }),
      filter((key): key is string => key != null),
      shareReplay(1)
    );

    this.verified$ = observableOf(true);

    this.verified$ = loadingService.waitFor(key$.pipe(
      switchMap(key =>
        this.verifyCheckService.verify(key).pipe(
          mapTo(true),
          catchError(err => {
            if(!(err instanceof HttpErrorResponse)) return observableThrowError(() => err);

            //TODO: this is maybe a bit hacky
            if (err.error?.error == "Already verified") return observableOf(true);

            router.navigate(['/']);
            return observableOf(false);
          })
        )
      )
    ));
	}
}
