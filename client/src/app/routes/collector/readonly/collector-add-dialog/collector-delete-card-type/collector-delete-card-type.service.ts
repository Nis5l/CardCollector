import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { Id } from '../../../../../shared/types';
import { CardTypeDeleteRequest, CardTypeDeleteResponse } from './types';

@Injectable()
export class CollectorDeleteCardTypeService {
	constructor(private readonly httpService: HttpService) {}

	public deleteCollectorRequest(collectorId: Id, data: CardTypeDeleteRequest): Observable<CardTypeDeleteResponse> {
		return this.httpService.post<CardTypeDeleteRequest, CardTypeDeleteResponse>(`/${collectorId}/card-type/request/delete`, data);
	}
}
