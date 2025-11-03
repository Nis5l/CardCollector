import { Component, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, switchMap, map, combineLatest as observableCombineLatest, startWith } from 'rxjs';

import { CollectorFriendsService } from './collector-friends.service';
import { LoadingService } from '../../../../shared/services';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import type { Id } from '../../../../shared/types';
import type { FriendResponse } from './types';
import { ProfileService } from '../../profile.service';

@Component({
    selector: "cc-collector-friends",
    templateUrl: "./collector-friends.component.html",
    styleUrls: ["./collector-friends.component.scss"],
    standalone: false
})
export class CollectorFriendsComponent extends SubscriptionManagerComponent {
	public readonly friends$: Observable<FriendResponse[]>;

  private readonly refreshFriendsSubject: Subject<void> = new Subject();

  constructor(
    private readonly collectorFriendsService: CollectorFriendsService,
    activatedRoute: ActivatedRoute,
    loadingService: LoadingService,
    profileService: ProfileService,
  ) {
    super();

    const params$ = activatedRoute.parent?.params ?? activatedRoute.params;
    const userId$ = params$.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId param not set");
        return userId;
      }),
    );

    this.friends$ = loadingService.waitFor(observableCombineLatest([userId$, this.refreshFriendsSubject.pipe(startWith(0))]).pipe(
      switchMap(([userId]) => this.collectorFriendsService.getFriends(userId))
    ));

    this.registerSubscription(this.refreshFriendsSubject.subscribe(() => {
      profileService.triggerProfileRefresh();
    }));
  }

  public acceptFriend(userId: Id): void {
    this.registerSubscription(this.collectorFriendsService.acceptFriend(userId).subscribe(
      () => this.refreshFriendsSubject.next()
    ));
  }

  public declineFriend(userId: Id): void {
    this.registerSubscription(this.collectorFriendsService.declineFriend(userId).subscribe(
      () => this.refreshFriendsSubject.next()
    ));
  }
}
