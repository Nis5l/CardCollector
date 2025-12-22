import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { CollectorUpdateRequest, CollectorConfig, CollectorModeratorIndexResponse } from '../../types';
import type { Collector, Id } from '../../../../shared/types';
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
}
