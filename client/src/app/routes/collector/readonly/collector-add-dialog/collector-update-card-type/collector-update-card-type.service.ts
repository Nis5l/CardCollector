import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { Id } from '../../../../../shared/types';
import { CollectorCardTypeRequestResponse, CollectorCardTypeRequestRequest } from './types';

@Injectable()
export class CollectorUpdateCardTypeService {
	constructor(private readonly httpService: HttpService) {}

	public updateCollectorRequest(collectorId: Id, data: CollectorCardTypeRequestRequest): Observable<CollectorCardTypeRequestResponse> {
		return this.httpService.post<CollectorCardTypeRequestRequest, CollectorCardTypeRequestResponse>(`/${collectorId}/card-type/request/update`, data);
	}
}
