import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { CardRequestRequest, CardRequestResponse } from './types';

@Injectable()
export class CollectorUpdateCardService {
	constructor(private readonly httpService: HttpService) {}

	public updateCardRequest(cardRequest: CardRequestRequest): Observable<CardRequestResponse> {
		return this.httpService.post<CardRequestRequest, CardRequestResponse>("/card/request/udpate", cardRequest);
	}
}
