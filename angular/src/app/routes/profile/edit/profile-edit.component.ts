import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of as observableOf, catchError, map, switchMap, combineLatest as observableCombineLatest, filter } from 'rxjs';

import { LoadingService, AuthService } from '../../../shared/services';
import type { Id } from '../../../shared/types';
import { ProfileService } from '../profile.service';
import type { Profile } from '../shared';

import { SubscriptionManagerComponent } from '../../../shared/abstract';

@Component({
    selector: "cc-profile-edit",
    templateUrl: "./profile-edit.component.html",
    styleUrls: ["./profile-edit.component.scss"],
    standalone: false
})
export class ProfileEditComponent extends SubscriptionManagerComponent {
	public profile$: Observable<(Profile & { userId: Id }) | null> = observableOf(null);

	constructor(
		private readonly profileService: ProfileService,
		private readonly router: Router,
		private readonly authService: AuthService,
		loadingService: LoadingService,
		activatedRoute: ActivatedRoute
	) {
		super();
		this.profile$ = loadingService.waitFor(activatedRoute.params.pipe(
			map(params => {
				const userId = params["userId"] as unknown;
				if(typeof userId !== "string") {
					throw new Error("userId is not a string");
				}
				return userId;
			}),
			switchMap(userId => this.profileService.getProfile(userId).pipe(
				map(profile => ({ ...profile, userId })),
				catchError(() => observableOf(null)))
			)
		));

		this.registerSubscription(observableCombineLatest([this.profile$, this.authService.authData()]).pipe(
			filter(([profile, authData]) => !AuthService.userIdEqual(profile?.userId, authData?.userId))
		).subscribe(([profile]) => this.navigateProfile(profile?.userId)));
	}

	public navigateProfile(userId: Id | undefined): void {
		if(userId == null) this.router.navigate(["home"]);
		this.router.navigate(["user", userId]);
	}
}
