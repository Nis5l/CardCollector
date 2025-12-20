import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Id } from '../../../../shared/types';
import { HttpService } from '../../../../shared/services';
import type { AddModeratorRequest, AddModeratorResponse, RemoveModeratorRequest, RemoveModeratorResponse } from './types';

@Injectable()
export class ModeratorEditorService {
	constructor(private readonly httpService: HttpService) {}

  public addModerator(collectorId: Id, userId: Id): Observable<AddModeratorResponse> {
    return this.httpService.post<AddModeratorRequest, AddModeratorResponse>(`/collector/${collectorId}/moderator/add`, { userId });
  }

  public removeModerator(collectorId: Id, userId: Id): Observable<RemoveModeratorResponse> {
    return this.httpService.post<RemoveModeratorRequest, RemoveModeratorResponse>(`/collector/${collectorId}/moderator/remove`, { userId });
  }
}
