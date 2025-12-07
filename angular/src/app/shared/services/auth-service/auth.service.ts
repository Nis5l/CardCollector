import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

import type { Id } from '../../types';
import type { AuthData } from './types';

@Injectable()
export class AuthService {
	private readonly authDataSubject: BehaviorSubject<AuthData | null> = new BehaviorSubject<AuthData | null>(null);

	constructor() {
		const accessToken = localStorage.getItem("access-token");
		const userId = localStorage.getItem("user-id");

		this.authDataSubject.next(
			accessToken != null && userId != null ? { userId, accessToken } : null
		);
	}

	public static userIdEqual(id1: Id | null | undefined, id2: Id | null | undefined): boolean {
		if(id1 == null || id2 == null) return false;
		return id1.toLowerCase() === id2.toLowerCase();
	}

	public logout(): void {
		["access-token", "user-id"].forEach(k => localStorage.removeItem(k));
		this.authDataSubject.next(null);
	}

	public login(authData: AuthData): void {
		authData.userId = authData.userId.toLowerCase();
		localStorage.setItem("access-token", authData.accessToken);
		localStorage.setItem("user-id", authData.userId);
		this.authDataSubject.next(authData);
	}

	public setAccessToken(accessToken: string): void {
		const data = this.authDataSubject.getValue();
		if(data == null) throw new Error("AuthData not set");

		localStorage.setItem("access-token", accessToken);
		this.authDataSubject.next({ ...data, accessToken });
	}

	public loggedIn(): Observable<boolean> {
		return this.authDataSubject.asObservable().pipe(map(id => id != null));
	}

	public authData(): Observable<AuthData | null> {
		return this.authDataSubject.asObservable();
	}

	public getUserId(): Id | null {
		return this.authDataSubject.getValue()?.userId ?? null;
	}

	public getAccessToken(): Id | null {
		return this.authDataSubject.getValue()?.accessToken ?? null;
	}

	public isUser(id: Id): boolean {
		return AuthService.userIdEqual(this.getUserId(), id.toLowerCase());
	}
}
