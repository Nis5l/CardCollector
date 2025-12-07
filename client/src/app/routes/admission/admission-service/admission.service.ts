import { Injectable } from '@angular/core';

import type { AdmissionConfig } from './types';

@Injectable()
export class AdmissionService {
	//TODO: get from server
	private readonly config: AdmissionConfig = {
		username: {
			minLength: 4,
			maxLength: 20
		},
		password: {
			minLength: 8,
			maxLength: 30
		}
	};

	public getConfig(): AdmissionConfig {
		return this.config;
	}
}
