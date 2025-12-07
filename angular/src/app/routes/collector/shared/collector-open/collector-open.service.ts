import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';
import type { Id } from '../../../../shared/types';
import type { PackOpenResponse, PackMaxTimeResponse, PackTimeResponse } from './types';

@Injectable()
export class CollectorOpenService {
	constructor(private readonly httpService: HttpService) {}

	public openPack(collectorId: Id): Observable<PackOpenResponse>{
		return this.httpService.post<any, PackOpenResponse>(`/pack/${collectorId}/open`, {});
	}

	public getMaxTime(collectorId: Id): Observable<PackMaxTimeResponse>{
		return this.httpService.get<PackMaxTimeResponse>(`/pack/${collectorId}/time/max`);
	}

	public getTime(collectorId: Id): Observable<PackTimeResponse>{
		return this.httpService.get<PackTimeResponse>(`/pack/${collectorId}/time`);
	}
}
