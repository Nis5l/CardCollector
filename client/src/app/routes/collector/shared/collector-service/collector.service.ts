import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { CollectorUpdateRequest, CollectorConfig, CollectorModeratorIndexResponse, CollectorCardTypeConfig, CardTypeIndexResponse } from '../../types';
import type { Collector, Id } from '../../../../shared/types';
import { CardState, CardTypeSortType } from '../../../../shared/types';
import { HttpService } from '../../../../shared/services';

@Injectable()
export class CollectorService {
	constructor(private readonly httpService: HttpService) {}

  public getConfig(): Observable<CollectorConfig> {
		return this.httpService.get<CollectorConfig>("/collector/config");
  }

	public getCollector(collectorId: Id): Observable<Collector> {
		return this.httpService.get(`/collector/${collectorId}`);
	}

	public updateCollector(collectorUpdateRequest: CollectorUpdateRequest): Observable<unknown> {
		return this.httpService.post<CollectorUpdateRequest, unknown>(`/collector/update`, collectorUpdateRequest);
	}

  public getModerators(collectorId: Id): Observable<CollectorModeratorIndexResponse> {
		return this.httpService.get<CollectorModeratorIndexResponse>(`/collector/${collectorId}/moderator`);
  }

	public getCardTypeConfig(): Observable<CollectorCardTypeConfig> {
		return this.httpService.get<CollectorCardTypeConfig>("/card-type/config");
	}

  //TODO: move this into card service or other way around idk
	public getCardTypes(collectorId: Id, name: string, page: number, state: CardState | null | undefined, sortType: CardTypeSortType): Observable<CardTypeIndexResponse> {
		let params = new HttpParams().set('name', name).set('sort_type', sortType);
    if(state != null) {
      params = params.set('state', state);
    }
		return this.httpService.get(`/${collectorId}/card-type`, params);
	}
}
