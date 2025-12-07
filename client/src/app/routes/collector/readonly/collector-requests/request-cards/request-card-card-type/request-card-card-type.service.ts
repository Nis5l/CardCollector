import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../../shared/services';
import type { Id } from '../../../../../../shared/types';

@Injectable()
export class RequestCardCardTypeService {
	constructor(private readonly httpService: HttpService) {}

	public accept(cardTypeId: Id): Observable<undefined> {
		return this.httpService.post(`/card-type/request/${cardTypeId}/accept`, {});
	}

	public decline(cardTypeId: Id): Observable<undefined> {
		return this.httpService.post(`/card-type/request/${cardTypeId}/decline`, {});
	}
}
