import { Component } from '@angular/core';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, of as observableOf, catchError, map, switchMap, combineLatest as observableCombineLatest, startWith, filter } from 'rxjs';

import { LoadingService, AuthService } from '../../../shared/services';
import type { Id } from '../../../shared/types';
import type { NavigationItem } from '../../../shared/components';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import { YesNoCancelDialogComponent } from '../../../shared/dialogs';
import { ProfileService } from '../profile.service';
import { FriendStatus, Profile } from '../shared';
import { CollectorFavoritesComponent } from './collector-favorites';
import { CollectorFriendsComponent } from './collector-friends';

type ProfileWithUserId = (Profile & { userId: Id });

const ROUTES: Route[] = [
  { path: "", pathMatch: "full", redirectTo: "favorites" },
  { path: "favorites", component: CollectorFavoritesComponent },
  { path: "friends", component: CollectorFriendsComponent },
];

@Component({
    selector: "cc-profile-readonly",
    templateUrl: "./profile-readonly.component.html",
    styleUrls: ["./profile-readonly.component.scss"],
    standalone: false
})
export class ProfileReadonlyComponent extends SubscriptionManagerComponent {
	public readonly profile$: Observable<ProfileWithUserId | null>;
	public readonly friendStatus$: Observable<FriendStatus>;
	public readonly canTrade$: Observable<boolean>;
	public readonly isSelf$: Observable<boolean>;
  public readonly refreshFriendStatus: Subject<void> = new Subject<void>();

  public readonly navigationItems: NavigationItem[] = [
    { name: "Favorites", link: "./favorites", icon: "star" },
    { name: "Friends", link: "./friends", icon: "group" },
  ];

  public get friendStatus(): typeof FriendStatus {
    return FriendStatus;
  }

	constructor(
		private readonly profileService: ProfileService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly router: Router,
		private readonly matDialog: MatDialog,
		private readonly authService: AuthService,
		loadingService: LoadingService,
	) {
    super();

    const userId$ = activatedRoute.params.pipe(
      map(params => {
        const userId = params["userId"] as unknown;
        if(typeof userId !== "string") {
          throw new Error("userId is not a string");
        }
        return userId;
      })
    );
		this.profile$ = loadingService.waitFor(observableCombineLatest([userId$, profileService.profileRefresh$.pipe(startWith(0))]).pipe(
        switchMap(([userId]) => this.profileService.getProfile(userId).pipe(
          map(profile => ({ ...profile, userId })),
          catchError(() => observableOf(null)))
        )
		));

    //NOTE: userId$ is falster than this.profile$
		this.isSelf$ = observableCombineLatest([userId$, this.authService.authData()]).pipe(
			map(([userId, authData]) => AuthService.userIdEqual(userId, authData?.userId))
		);

    //NOTE: userId$ is falster than this.profile$
    this.friendStatus$ = observableCombineLatest([
      userId$,
      this.refreshFriendStatus.asObservable().pipe(startWith(() => {}))
    ]).pipe(
      switchMap(([userId]) => this.profileService.friendStatus(userId)),
      map(friendStatus => friendStatus.status)
    );

    this.canTrade$ = observableCombineLatest([this.isSelf$, this.friendStatus$]).pipe(
      map(([isSelf, friendStatus]) => !isSelf && friendStatus == FriendStatus.Friend)
    );
	}

	public edit(): void {
		this.router.navigate(["edit"], { relativeTo: this.activatedRoute });
	}

  public addFriend(userId: Id): void {
    this.registerSubscription(this.profileService.addFriend(userId).subscribe(
      () => this.refreshFriendStatus.next()
    ));
  }

  public removeFriend(userId: Id, confirmationDialog: boolean): void {
    const dialog$: Observable<boolean | undefined> = confirmationDialog ? YesNoCancelDialogComponent.open(this.matDialog, "Remove as Friend?") : observableOf(true);

    this.registerSubscription(dialog$.pipe(
      filter(confirm => confirm === true),
      switchMap(() => this.profileService.removeFriend(userId))
    ).subscribe(() => this.refreshFriendStatus.next()));
  }

  public static getRoutes(){
    return ROUTES;
  }
}
