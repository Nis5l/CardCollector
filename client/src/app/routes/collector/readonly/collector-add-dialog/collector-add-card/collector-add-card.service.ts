import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { CardCreateRequest, CardCreateResponse } from './types';

@Injectable()
export class CollectorAddCardService {
	constructor(private readonly httpService: HttpService) {}

	public createCardRequest(cardRequest: CardCreateRequest): Observable<CardCreateResponse> {
		return this.httpService.post<CardCreateRequest, CardCreateResponse>("/card/request/create", cardRequest);
	}
}
