import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';
import type { Id } from '../../../../shared/types';
import type { CollectorFavoriteResponse, CollectorFavoriteAddResponse, CollectorFavoriteRemoveResponse } from './types';

@Injectable()
export class CollectorFavoriteService {
	constructor(private readonly httpService: HttpService) {}

	public getFavorite(id: Id): Observable<CollectorFavoriteResponse> {
		return this.httpService.get<CollectorFavoriteResponse>(`/collector/${id}/favorite`);
	}

	public addFavorite(id: Id): Observable<CollectorFavoriteAddResponse> {
		return this.httpService.post<any, CollectorFavoriteAddResponse>(`/collector/${id}/favorite/add`, {});
	}

	public removeFavorite(id: Id): Observable<CollectorFavoriteRemoveResponse> {
		return this.httpService.post<any, CollectorFavoriteRemoveResponse>(`/collector/${id}/favorite/remove`, {});
	}
}
