import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Id } from '../../../../shared/types';
import { HttpService } from '../../../../shared/services';
import type { GetSettingsResponse, SetSettingsRequest } from './types';

@Injectable()
export class SettingsEditorService {
	constructor(private readonly httpService: HttpService) {}

  public getSettings(collectorId: Id): Observable<GetSettingsResponse> {
    return this.httpService.get<GetSettingsResponse>(`/collector/${collectorId}/config`);
  }

  public setSettings(collectorId: Id, req: SetSettingsRequest): Observable<unknown> {
    return this.httpService.post<SetSettingsRequest, unknown>(`/collector/${collectorId}/config`, req);
  }
}
