import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../shared/services';
import type { Id, InventoryResponse } from '../../../shared/types';
import type { UpgradeResponse, UpgradeRequest } from './types';

@Injectable()
export class CardUpgradeService {
  constructor(private readonly httpService: HttpService) {}

  public getUpgradeCards(userId: Id, collectorId: Id, page: number, level: number, exludeIds: Id[]): Observable<InventoryResponse> {
    return this.httpService.post(`/user/${userId}/${collectorId}/inventory`, { page, level, excludeUuids: exludeIds });
  }

  public upgrade(cardOne: Id, cardTwo: Id): Observable<UpgradeResponse> {
    return this.httpService.post<UpgradeRequest, UpgradeResponse>(`/card/upgrade`, { cardOne, cardTwo });
  }
}
