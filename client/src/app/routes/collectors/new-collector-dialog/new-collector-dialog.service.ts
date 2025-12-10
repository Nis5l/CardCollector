import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../shared/services';
import type { CollectorCreateResponse, CollectorCreateRequest } from './types';

@Injectable()
export class NewCollectorDialogService {
	constructor(private readonly httpService: HttpService) {}

	public createCollector(data: CollectorCreateRequest): Observable<CollectorCreateResponse> {
		return this.httpService.post<CollectorCreateRequest, CollectorCreateResponse>("/collector/create", data);
	}
}
