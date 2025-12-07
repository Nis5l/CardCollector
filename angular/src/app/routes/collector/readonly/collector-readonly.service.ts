import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpService } from '../../../shared/services';
import type { Id } from '../../../shared/types';
import { CardState } from '../../../shared/types';
import type { CardTypeIndexResponse } from './types';

@Injectable()
export class CollectorReadonlyService {
	constructor(private readonly httpService: HttpService) {}

	public indexRequestedCardTypes(collectorId: Id, name: string, page: number): Observable<CardTypeIndexResponse> {
		const params = new HttpParams().set('name', name).set('page', page).set('state', CardState.Requested);
		return this.httpService.get(`/${collectorId}/card-type`, params);
	}
}
