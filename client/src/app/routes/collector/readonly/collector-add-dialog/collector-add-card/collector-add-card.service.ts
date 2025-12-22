import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { Id } from '../../../../../shared/types';
import type { CardRequestRequest, CardRequestResponse } from './types';

@Injectable()
export class CollectorAddCardService {
	constructor(private readonly httpService: HttpService) {}

	public createCardRequest(cardRequest: CardRequestRequest): Observable<CardRequestResponse> {
		return this.httpService.post<CardRequestRequest, CardRequestResponse>("/card/request/create", cardRequest);
	}
}
