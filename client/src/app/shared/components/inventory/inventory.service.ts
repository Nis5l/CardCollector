import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../services';
import type { Id, InventoryResponse } from '../../types';
import { SortType } from './types';

@Injectable()
export class InventoryService {
  constructor(private readonly httpService: HttpService) {}

  public getInventory(userId: Id, collectorId: Id, page: number, search: string, sortType: SortType, excludeUuids: Id[], level: number | null | undefined): Observable<InventoryResponse> {
    return this.httpService.post(`/user/${userId}/${collectorId}/inventory`, { page, search, sortType, excludeUuids, level });
  }
}
