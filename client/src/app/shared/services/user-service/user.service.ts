import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of as observableOf, map } from 'rxjs';

import type { UsernameResponse, CollectorIsOwnerModeratorResponse, CollectorIsOwnerResponse } from './types';
import { HttpService } from '../http-service';
import { AuthService  } from '../auth-service';
import type { Id } from '../../types';

@Injectable()
export class UserService {
	constructor(
		private readonly httpService: HttpService,
		private readonly authService: AuthService,
		private readonly router: Router,
	) {}

	public getUsername(): Observable<string | null> {
		const userId = this.authService.getUserId();
		if(userId == null) return observableOf(null);
		return this.getUsernameById(userId);
	}

	public getUsernameById(userId: Id): Observable<string> {
		return this.httpService.get<UsernameResponse>(`/user/${userId}/username`).pipe(
			map((res: UsernameResponse): string => res.username)
		);
	}

	public isCollectorOwnerModerator(collectorId: Id): Observable<boolean> {
		const userId = this.authService.getUserId();
		if(userId == null) return observableOf(false);
		return this.httpService.get<CollectorIsOwnerModeratorResponse>(`/user/${userId}/${collectorId}/is-owner-moderator`).pipe(
			map((res: CollectorIsOwnerModeratorResponse): boolean => res.isOwnerModerator)
		);
	}

	public isCollectorOwner(collectorId: Id): Observable<boolean> {
		const userId = this.authService.getUserId();
		if(userId == null) return observableOf(false);
		return this.httpService.get<CollectorIsOwnerResponse>(`/user/${userId}/${collectorId}/is-owner`).pipe(
			map((res: CollectorIsOwnerResponse): boolean => res.isOwner)
		);
	}

	public navigateUser(userId: Id): void {
		this.router.navigate(["/user", userId]);
	}
}
