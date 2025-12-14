import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../../shared/services';
import type { Id } from '../../../../../../shared/types';
import type { VoteGetResponse, VotePostRequest } from './types';
import { CardVote } from "../shared/types";

@Injectable()
export class RequestCardCardService {
	constructor(private readonly httpService: HttpService) {}

	public accept(cardId: Id): Observable<undefined> {
		return this.httpService.post(`/card/request/${cardId}/accept`, {});
	}

	public decline(cardId: Id): Observable<undefined> {
		return this.httpService.post(`/card/request/${cardId}/decline`, {});
	}

	public votes(cardId: Id): Observable<VoteGetResponse> {
		return this.httpService.get<VoteGetResponse>(`/card/request/${cardId}/vote`);
	}

	public vote(cardId: Id, vote: CardVote): Observable<unknown> {
		return this.httpService.post<VotePostRequest, unknown>(`/card/request/${cardId}/vote`, { vote });
	}
}
