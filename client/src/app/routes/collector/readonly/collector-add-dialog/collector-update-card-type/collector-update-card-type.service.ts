import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { Id } from '../../../../../shared/types';
import { CardTypeUpdateRequest, CardTypeUpdateResponse } from './types';

@Injectable()
export class CollectorUpdateCardTypeService {
	constructor(private readonly httpService: HttpService) {}

	public updateCollectorRequest(collectorId: Id, data: CardTypeUpdateRequest): Observable<CardTypeUpdateResponse> {
		return this.httpService.post<CardTypeUpdateRequest, CardTypeUpdateResponse>(`/${collectorId}/card-type/request/update`, data);
	}
}
