import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../../shared/services';
import type { Id } from '../../../../../../shared/types';

@Injectable()
export class RequestCardCardService {
	constructor(private readonly httpService: HttpService) {}

	public accept(cardId: Id): Observable<undefined> {
		return this.httpService.post(`/card/request/${cardId}/accept`, {});
	}

	public decline(cardId: Id): Observable<undefined> {
		return this.httpService.post(`/card/request/${cardId}/decline`, {});
	}
}
