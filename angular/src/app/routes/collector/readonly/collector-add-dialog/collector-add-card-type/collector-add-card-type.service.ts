import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { Id } from '../../../../../shared/types';
import { CollectorCardTypeConfig, CollectorCardTypeRequestResponse, CollectorCardTypeRequestRequest } from './types';

@Injectable()
export class CollectorAddCardTypeService {
	constructor(private readonly httpService: HttpService) {}

	public getConfig(): Observable<CollectorCardTypeConfig> {
		return this.httpService.get<CollectorCardTypeConfig>("/card-type/config");
	}

	public createCollectorRequest(collectorId: Id, data: CollectorCardTypeRequestRequest): Observable<CollectorCardTypeRequestResponse> {
		return this.httpService.post<CollectorCardTypeRequestRequest, CollectorCardTypeRequestResponse>(`/${collectorId}/card-type/request`, data);
	}
}
