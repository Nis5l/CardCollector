import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpService } from '../../shared/services';
import type { UsersResponse } from './types';

@Injectable()
export class UsersService {
  constructor(private readonly httpService: HttpService) {}

  public getUsers(username: string, page: number): Observable<UsersResponse> {
    const params = new HttpParams().set("username", username).set("page", page);
    return this.httpService.get<UsersResponse>("/user", params);
  }
}
