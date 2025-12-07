import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Collector, Id } from '../../shared/types';
import { HttpService } from '../../shared/services';

@Injectable()
export class CollectorService {
	constructor(private readonly httpService: HttpService) {}

	public getCollector(collectorId: Id): Observable<Collector> {
		return this.httpService.get(`/collector/${collectorId}`);
	}
}
