import { Injectable } from '@angular/core'
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../../shared/services';
import type { Id } from '../../../../../../shared/types';
import { CardState } from '../../../../../../shared/types';
import type { CardTypeIndexResponse } from '../../../types';

@Injectable()
export class CardTypeSelectorService {
	constructor(private readonly httpService: HttpService) {}

	public getCardTypes(collectorId: Id, name: string): Observable<CardTypeIndexResponse> {
		const params = new HttpParams().set('name', name).set('state', CardState.Created);
		return this.httpService.get(`/${collectorId}/card-type`, params);
	}
}
