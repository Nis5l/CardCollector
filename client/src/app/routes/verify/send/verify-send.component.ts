import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest, tap, switchMap, shareReplay, interval, startWith, map, Subject } from 'rxjs';

import { UserVerified } from './types';
import { VerifySendService } from './verify-send.service';
import { SubscriptionManagerComponent } from '../../../shared/abstract';

@Component({
    selector: 'cc-verify-send',
    templateUrl: './verify-send.component.html',
    styleUrls: ['./verify-send.component.scss'],
    standalone: false
})
export class VerifySendComponent extends SubscriptionManagerComponent {
  private readonly refreshTimeSubject: Subject<void> = new Subject();
  public readonly email$: Observable<string>;
  public readonly canResend$: Observable<boolean>;
  public readonly countdown$: Observable<string>;

	constructor(
    private readonly verifySendService: VerifySendService,
    router: Router,
  ) {
    super();

    const now$ = interval(1000).pipe(
      startWith(0),
      map(() => new Date())
    );

    const time$ = this.refreshTimeSubject.pipe(
      startWith(0),
      switchMap(() => verifySendService.getTime().pipe(shareReplay(1)))
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

    this.email$ = this.verifySendService.verifyCheck().pipe(
      tap(({verified }) => {
        if (verified == UserVerified.Yes) {
          router.navigate(["/"]);
        }
      }),
      map(({ email }) => email),
    );
	}

  public resend(): void {
    this.registerSubscription(
      this.verifySendService.resend().subscribe(() => {
        this.refreshTimeSubject.next();
      })
    );
  }
}
