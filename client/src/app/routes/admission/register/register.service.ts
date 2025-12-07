import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { RegisterRequest, RegisterResponse } from './types';
import { HttpService } from '../../../shared/services';

@Injectable()
export class RegisterService {
	constructor(private readonly httpService: HttpService) {}

	public register(config: RegisterRequest): Observable<RegisterResponse> {
		return this.httpService.post<RegisterRequest, RegisterResponse>("/register", config);
	}
}
