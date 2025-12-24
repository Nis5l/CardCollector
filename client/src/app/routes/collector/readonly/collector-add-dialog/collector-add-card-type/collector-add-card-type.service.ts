import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { Id } from '../../../../../shared/types';
import { CardTypeCreateRequest, CardTypeCreateResponse } from './types';

@Injectable()
export class CollectorAddCardTypeService {
	constructor(private readonly httpService: HttpService) {}

	public createCollectorRequest(collectorId: Id, data: CardTypeCreateRequest): Observable<CardTypeCreateResponse> {
		return this.httpService.post<CardTypeCreateRequest, CardTypeCreateResponse>(`/${collectorId}/card-type/request/create`, data);
	}
}
