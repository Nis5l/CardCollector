import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';
import type { Id } from '../../../../shared/types';
import type { FriendResponse } from './types';

@Injectable()
export class CollectorFriendsService {
  constructor(private readonly httpService: HttpService) {}

  public getFriends(userId: Id): Observable<FriendResponse[]> {
    return this.httpService.get<FriendResponse[]>(`/user/${userId}/friends`);
  }

  public acceptFriend(userId: Id): Observable<unknown> {
    return this.httpService.post<{}, unknown>(`/friend/${userId}/accept`, {});
  }

  public declineFriend(userId: Id): Observable<unknown> {
    return this.httpService.post<{}, unknown>(`/friend/${userId}/remove`, {});
  }
}
