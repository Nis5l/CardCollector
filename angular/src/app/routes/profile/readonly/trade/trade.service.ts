import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';
import type { Id } from '../../../../shared/types';
import type { TradeInfoResponse } from './types';

@Injectable()
export class TradeService {
  constructor(private readonly httpService: HttpService) {}

  public getTradeinfo(userId: Id, collectorId: Id): Observable<TradeInfoResponse> {
    return this.httpService.get(`/trade/${userId}/${collectorId}`);
  }

  public removeCard(friendId: Id, collectorId: Id, cardId: Id): Observable<void> {
    return this.httpService.post(`/trade/${friendId}/${collectorId}/card/remove/${cardId}`, {});
  }

  public removeSuggestion(friendId: Id, collectorId: Id, cardId: Id): Observable<void> {
    return this.httpService.post(`/trade/${friendId}/${collectorId}/suggestion/remove/${cardId}`, {});
  }

  public confirm(friendId: Id, collectorId: Id): Observable<void> {
    return this.httpService.post(`/trade/${friendId}/${collectorId}/confirm`, {});
  }

  public addCard(userId: Id, collectorId: Id, cardId: Id): Observable<unknown> {
    return this.httpService.post(`/trade/${userId}/${collectorId}/card/add/${cardId}`, {});
  }
}
