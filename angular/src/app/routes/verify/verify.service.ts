import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import type { MailGetResponse, VerifyTimeResponse, VerifyCheckResponse } from './types';
import { HttpService } from '../../shared/services';

@Injectable()
export class VerifyService {
	constructor(private readonly httpService: HttpService) {}

  public getEmail(): Observable<string> {
    return this.httpService.get<MailGetResponse>("/email").pipe(
      map(({ email }) => email)
    );
  }

  public getTime(): Observable<Date> {
    return this.httpService.get<VerifyTimeResponse>("/verify/time").pipe(
      map(({ time }) => new Date(time))
    );
  }

  public resend(): Observable<unknown> {
    return this.httpService.post<{}, unknown>("/verify/resend", {});
  }

  public verify(key: string): Observable<unknown> {
    return this.httpService.post<{}, unknown>(`/verify/confirm/${key}`, {});
  }

  public verifyCheck(): Observable<VerifyCheckResponse> {
    return this.httpService.get<VerifyCheckResponse>(`/verify/check`);
  }
}
