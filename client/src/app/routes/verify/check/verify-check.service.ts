import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../shared/services';

@Injectable()
export class VerifyCheckService {
	constructor(private readonly httpService: HttpService) {}
  public verify(key: string): Observable<unknown> {
    return this.httpService.post<{}, unknown>(`/verify/confirm/${key}`, {});
  }
}
