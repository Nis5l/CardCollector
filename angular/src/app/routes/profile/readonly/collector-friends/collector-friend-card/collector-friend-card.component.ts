import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, filter, map, combineLatest as observableCombineLatest } from 'rxjs';

import { FriendStatus } from '../../../shared';
import type { Id } from '../../../../../shared/types';
import { AuthService } from '../../../../../shared/services';
import type { FriendResponse } from '../types';

@Component({
  selector: "cc-friend-card",
  templateUrl: "./collector-friend-card.component.html",
  styleUrls: [ "./collector-friend-card.component.scss" ],
})
export class CollectorFriendCardComponent {
  public readonly FriendStatus = FriendStatus;

  @Output()
  public readonly onFriendAccept: EventEmitter<Id> = new EventEmitter<Id>();
  @Output()
  public readonly onFriendDecline: EventEmitter<Id> = new EventEmitter<Id>();

  public readonly isSelf$: Observable<boolean>;

  public readonly friendSubject: BehaviorSubject<FriendResponse | null> = new BehaviorSubject<FriendResponse | null>(null);
  public readonly friendResponse$: Observable<FriendResponse>;
  @Input()
  public set friend(friendResponse: FriendResponse) {
    this.friendSubject.next(friendResponse);
  }

  public get friend(): FriendResponse {
    const friendResponse = this.friendSubject.getValue();
    if(friendResponse == null) throw new Error("friendResponse not set");
    return friendResponse;
  }

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute, private readonly authService: AuthService) {
    this.friendResponse$ = this.friendSubject.pipe(
      filter((friendResponse): friendResponse is NonNullable<typeof friendResponse> => friendResponse != null)
    );

    const params$ = this.activatedRoute.parent?.params ?? this.activatedRoute.params;

    const userId$ = params$.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId param not set");
        return userId;
      }),
    );

    //NOTE: userId$ is falster than this.profile$
		this.isSelf$ = observableCombineLatest([userId$, this.authService.authData()]).pipe(
			map(([userId, authData]) => AuthService.userIdEqual(userId, authData?.userId))
		);
  }

  public userClick(userId: Id): void {
    this.router.navigate(["user", userId]);
  }

  public declineFriend(event: Event, userId: Id): void {
    event.stopPropagation();
    this.onFriendDecline.emit(userId);
  }

  public acceptFriend(event: Event, userId: Id): void {
    event.stopPropagation();
    this.onFriendAccept.emit(userId);
  }

  public stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
