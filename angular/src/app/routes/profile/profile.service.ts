import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { HttpService } from '../../shared/services';
import type { Id } from '../../shared/types';
import type { Profile, FriendStatusResponse } from './shared';

@Injectable()
export class ProfileService {
  private readonly profileRefreshSubject: Subject<void> = new Subject<void>();
  public readonly profileRefresh$: Observable<void>;

	constructor(private readonly httpService: HttpService) {
    this.profileRefresh$ = this.profileRefreshSubject.asObservable();
  }

	public getProfile(userId: Id): Observable<Profile> {
		return this.httpService.get(`/user/${userId}/stats`);
	}

  public friendStatus(userId: Id): Observable<FriendStatusResponse> {
    return this.httpService.get<FriendStatusResponse>(`/friend/${userId}/status`);
  }

  public addFriend(userId: Id): Observable<unknown> {
    return this.httpService.post<{}, unknown>(`/friend/${userId}/add`, {});
  }

  public removeFriend(userId: Id): Observable<unknown> {
    return this.httpService.post<{}, unknown>(`/friend/${userId}/remove`, {});
  }

  public triggerProfileRefresh(): void {
    this.profileRefreshSubject.next();
  }
}
