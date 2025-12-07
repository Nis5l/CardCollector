import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { Id } from '../../../../../shared/types';
import type { CollectorAddCardConfig, CardRequestRequest, CardRequestResponse } from './types';

@Injectable()
export class CollectorAddCardService {
	constructor(private readonly httpService: HttpService) {}

	public getConfig(): Observable<CollectorAddCardConfig> {
		return this.httpService.get<CollectorAddCardConfig>("/card/config");
	}

	public createCardRequest(cardRequest: CardRequestRequest): Observable<CardRequestResponse> {
		return this.httpService.post<CardRequestRequest, CardRequestResponse>("/card/request", cardRequest);
	}

	public setCardImage(cardId: Id, image: File): Observable<unknown> {
		return this.httpService.putFile<unknown>(`/card/${cardId}/card-image`, image);
	}
}
