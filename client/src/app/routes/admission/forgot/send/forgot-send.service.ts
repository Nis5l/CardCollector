import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';

import type { ForgotRequest, ForgotResponse } from './types';

@Injectable()
export class ForgotSendService {
	constructor(private readonly httpService: HttpService) {}

	public forgot(body: ForgotRequest): Observable<ForgotResponse> {
		return this.httpService.post<ForgotRequest, ForgotResponse>("/forgot", body);
	}
}
