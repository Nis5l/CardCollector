import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { CardUpdateRequest, CardUpdateResponse } from './types';

@Injectable()
export class CollectorUpdateCardService {
	constructor(private readonly httpService: HttpService) {}

	public updateCardRequest(cardRequest: CardUpdateRequest): Observable<CardUpdateResponse> {
		return this.httpService.post<CardUpdateRequest, CardUpdateResponse>("/card/request/update", cardRequest);
	}
}
