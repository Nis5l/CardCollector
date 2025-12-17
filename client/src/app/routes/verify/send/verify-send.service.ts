import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import type { VerifyTimeResponse, VerifyCheckResponse } from './types';
import { HttpService } from '../../../shared/services';

@Injectable()
export class VerifySendService {
	constructor(private readonly httpService: HttpService) {}

  public getTime(): Observable<Date> {
    return this.httpService.get<VerifyTimeResponse>("/verify/time").pipe(
      map(({ time }) => new Date(time))
    );
  }

  public resend(): Observable<unknown> {
    return this.httpService.post<{}, unknown>("/verify/resend", {});
  }

  public verifyCheck(): Observable<VerifyCheckResponse> {
    return this.httpService.get<VerifyCheckResponse>(`/verify/check`);
  }
}
