import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { AdmissionConfig } from './types';
import { HttpService } from '../../../shared/services';

@Injectable()
export class AdmissionService {
  constructor(private readonly httpService: HttpService) {}

	public getConfig(): Observable<AdmissionConfig> {
    return this.httpService.get<AdmissionConfig>("/admission/config");
	}
}
