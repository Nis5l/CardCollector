import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';
import type { Id } from '../../../../shared/types';

@Injectable()
export class CollectorBannerService {
	constructor(private readonly httpService: HttpService) {}

	public getBannerUrl(collectorId: Id): string {
		return this.httpService.apiUrl(`/collector/${collectorId}/banner`);
	}

	public uploadBanner(collectorId: Id, file: File): Observable<void> {
		return this.httpService.putFile(`/collector/${collectorId}/banner`, file);
	}
}
