import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpService } from '../../services';
import type { Id } from '../../types';
import type { UsersResponse } from './types';

@Injectable()
export class UserListService {
  constructor(private readonly httpService: HttpService) {}

  public getUsers(username: string, page: number, excludeIds: Id[]): Observable<UsersResponse> {
    let params = new HttpParams().set("username", username).set("page", page);
    excludeIds.forEach(id => params = params.append('exclude_ids', id));
    return this.httpService.get<UsersResponse>("/user", params);
  }
}
