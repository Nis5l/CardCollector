import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';

import type { ForgotResetRequest, ForgotResetResponse } from './types';

@Injectable()
export class ForgotResetService {
	constructor(private readonly httpService: HttpService) {}

	public reset(body: ForgotResetRequest): Observable<ForgotResetResponse> {
		return this.httpService.post<ForgotResetRequest, ForgotResetResponse>("/forgot/reset", body);
	}

	public check(key: string): Observable<unknown> {
		return this.httpService.get<unknown>(`/forgot/check/${key}`);
	}
}
