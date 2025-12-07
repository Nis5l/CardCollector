import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';
import type { Id } from '../../../../shared/types';

@Injectable()
export class CollectorImageService {
	constructor(private readonly httpService: HttpService) {}

	public getImageUrl(id: Id): string {
		return this.httpService.apiUrl(`/collector/${id}/collector-image`);
	}

	public uploadImage(collectorId: Id, image: File): Observable<undefined> {
		return this.httpService.putFile(`/collector/${collectorId}/collector-image`, image);
	}
}
