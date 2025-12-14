import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../../shared/services';
import type { Id } from '../../../../../../shared/types';
import type { VoteGetResponse, VotePostRequest } from './types';
import { CardVote } from "../shared/types";

@Injectable()
export class RequestCardCardTypeService {
	constructor(private readonly httpService: HttpService) {}

	public accept(cardTypeId: Id): Observable<undefined> {
		return this.httpService.post(`/card-type/request/${cardTypeId}/accept`, {});
	}

	public decline(cardTypeId: Id): Observable<undefined> {
		return this.httpService.post(`/card-type/request/${cardTypeId}/decline`, {});
	}

	public votes(cardId: Id): Observable<VoteGetResponse> {
		return this.httpService.get<VoteGetResponse>(`/card-type/request/${cardId}/vote`);
	}

	public vote(cardId: Id, vote: CardVote): Observable<unknown> {
		return this.httpService.post<VotePostRequest, unknown>(`/card-type/request/${cardId}/vote`, { vote });
	}
}
