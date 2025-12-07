import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';
import type { Id, Collector } from '../../../../shared/types';

@Injectable()
export class CollectorFavoritesService {
  constructor(private readonly httpService: HttpService) {
  }

  public favoriteCollectors(userId: Id): Observable<Collector[]> {
    return this.httpService.get<Collector[]>(`/collector/favorite/${userId}`);
  }
}
