import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { HttpService } from '../../../shared/services';
import type { CreateConfigCollectorResponse, NewCollectorConfig, CollectorCreateResponse, CollectorCreateRequest } from './types';

@Injectable()
export class NewCollectorDialogService {
	private config: NewCollectorConfig = {
		name: {
			minLength: 0,
			maxLength: 0
		}
	};

	private loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private readonly httpService: HttpService) {
		//TODO: this doesnt seem to make sense, why is the config created, collector name len should be global, min_length should be minLength etc.
		//And use Observables
		
		// Load config from server
		this.loadingSubject.next(true);
		this.httpService.get<CreateConfigCollectorResponse>("/collector/create-config").subscribe((res: CreateConfigCollectorResponse) => {
			this.config.name.minLength = res.min_length;
			this.config.name.maxLength = res.max_length;
			this.loadingSubject.next(false);
		});
	}

	public loading(): Observable<boolean>{
		return this.loadingSubject.asObservable();
	}

	public getConfig(): NewCollectorConfig {
		return this.config;
	}

	public createCollector(data: CollectorCreateRequest): Observable<CollectorCreateResponse> {
		return this.httpService.post<CollectorCreateRequest, CollectorCreateResponse>("/collector/create", data);
	}
}
