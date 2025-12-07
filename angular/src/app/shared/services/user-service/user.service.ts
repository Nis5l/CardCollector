import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of as observableOf, map } from 'rxjs';

import type { UsernameResponse, CollectorIsAdminResponse } from './types';
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

	public isCollectorAdmin(collectorId: Id): Observable<boolean> {
		const userId = this.authService.getUserId();
		if(userId == null) return observableOf(false);
		return this.httpService.get<CollectorIsAdminResponse>(`/user/${userId}/${collectorId}/is-admin`).pipe(
			map((res: CollectorIsAdminResponse): boolean => res.isAdmin)
		);
	}

	public navigateUser(userId: Id): void {
		this.router.navigate(["/user", userId]);
	}
}
