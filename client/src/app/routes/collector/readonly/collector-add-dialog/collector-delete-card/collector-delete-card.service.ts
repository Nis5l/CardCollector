import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { CardDeleteRequest, CardDeleteResponse } from './types';

@Injectable()
export class CollectorDeleteCardService {
	constructor(private readonly httpService: HttpService) {}

	public deleteCardRequest(cardRequest: CardDeleteRequest): Observable<CardDeleteResponse> {
		return this.httpService.post<CardDeleteRequest, CardDeleteResponse>("/card/request/delete", cardRequest);
	}
}
