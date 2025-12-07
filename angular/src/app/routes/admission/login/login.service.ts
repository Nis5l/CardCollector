import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { HttpService, AuthService } from '../../../shared/services';

import type { LoginRequest, LoginResponse } from './types';

@Injectable()
export class LoginService {
	constructor(private readonly httpService: HttpService, private readonly authService: AuthService) {}

	public login(body: LoginRequest): Observable<LoginResponse> {
		return this.httpService.post<LoginRequest, LoginResponse>("/login", body, { withCredentials: true }, false).pipe(
			tap((res: LoginResponse) => {
				this.authService.login(res);
			})
		);
	}
}
