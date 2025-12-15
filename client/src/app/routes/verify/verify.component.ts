import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, EMPTY, combineLatest, tap, switchMap, shareReplay, interval, startWith, map, Subject, filter, catchError } from 'rxjs';

import { UserVerified } from './types';
import { VerifyService } from './verify.service';
import { SubscriptionManagerComponent } from '../../shared/abstract';

@Component({
    selector: 'cc-verify',
    templateUrl: './verify.component.html',
    styleUrls: ['./verify.component.scss'],
    standalone: false
})
export class VerifyComponent extends SubscriptionManagerComponent {
  private readonly refreshTimeSubject: Subject<void> = new Subject();
  public readonly email$: Observable<string>;
  public readonly canResend$: Observable<boolean>;
  public readonly countdown$: Observable<string>;

	constructor(
    private readonly verifyService: VerifyService,
    route: ActivatedRoute,
    router: Router,
  ) {
    super();

    this.email$ = verifyService.getEmail();

    const now$ = interval(1000).pipe(
      startWith(0),
      map(() => new Date())
    );

    const time$ = this.refreshTimeSubject.pipe(
      startWith(0),
      switchMap(() => verifyService.getTime().pipe(shareReplay(1)))
    );

    this.canResend$ = combineLatest([time$, now$]).pipe(
      map(([resendTime, now]) => now.getTime() >= resendTime.getTime())
    );

    this.countdown$ = combineLatest([time$, now$]).pipe(
      map(([resend, now]) => {
        const diff = Math.max(0, resend.getTime() - now.getTime());
        const sec = Math.ceil(diff / 1000);
        const min = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${min}:${seconds.toString().padStart(2, '0')}`;
      })
    );

    const key$ = route.queryParamMap.pipe(
      map(params => params.get('key')),
      shareReplay(1)
    );

    this.registerSubscription(
      key$.pipe(
        filter((key): key is string => key != null),
        switchMap(key =>
          this.verifyService.verify(key).pipe(
            tap(() => {
              router.navigate(['/']);
            }),
            catchError(err => {
              console.error('Verification failed', err);
              return EMPTY;
            })
          )
        )
      ).subscribe()
    );

    this.registerSubscription(
      this.verifyService.verifyCheck().subscribe(
        ({ verified }) => {
          if(verified == UserVerified.Ok) {
            router.navigate(["/"]);
          }
        }
      )
    );
	}

  public resend(): void {
    this.registerSubscription(
      this.verifyService.resend().subscribe(() => {
        this.refreshTimeSubject.next();
      })
    );
  }
}
