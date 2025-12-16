import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError as observableThrowError, tap, switchMap, share, EMPTY } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { AuthService } from '../auth-service';
import type { RefreshResponse } from './types';

interface Headers {
	[key: string]: string
}

interface HttpOptions {
	withCredentials?: boolean,
}

@Injectable()
export class HttpService {
	private readonly api = environment.apiUrl;
	private readonly headers: Headers = {
		'Content-Type': 'application/json',
	};
	private refreshRequest: Observable<RefreshResponse>;

	constructor(
		private readonly httpClient: HttpClient,
		private readonly router: Router,
    private ngZone: NgZone,
		private readonly authService: AuthService
	) {
		this.refreshRequest = this.httpClient.get<RefreshResponse>(this.apiUrl("/refresh"), { withCredentials: true }).pipe(
			catchError((err: unknown) => {
        this.ngZone.run(() => {
          this.router.navigate(['logout']);
        });
        return EMPTY;
			}),
			tap(res => this.authService.setAccessToken(res.accessToken)),
			share(),
      //shareReplay(1)
		);
	}

	public putFile<TRes>(url: string, file: File): Observable<TRes> {
		const formData: FormData = new FormData();
    	formData.append('file', file);

		const req = () => {
			let headers = { ...this.getHeaders() };
			delete headers['Content-Type'];
			return this.httpClient.put<TRes>(this.apiUrl(url), formData, { headers } );
		};

		return this.request(req);
	}

	public get<TRes>(url: string, params?: HttpParams): Observable<TRes> {
		const req = () => this.httpClient.get<TRes>(this.apiUrl(url), { params, headers: this.getHeaders() } );
		return this.request(req);
	}

	public post<TBody, TRes>(url: string, body: TBody, options?: HttpOptions, refresh: boolean = true): Observable<TRes> {
		const req = () => this.httpClient.post<TRes>(this.apiUrl(url), body, { ...options, headers: this.getHeaders() })
		return this.request(req, refresh);
	}

	public delete<TRes>(url: string): Observable<TRes> {
		const req = () => this.httpClient.delete<TRes>(this.apiUrl(url), { headers: this.getHeaders() })
		return this.request(req);
	}

	public apiUrl(url: string): string {
		return `${this.api}${url}`;
	}

	private request<TRes>(req: () => Observable<TRes>, refresh: boolean = true): Observable<TRes> {
		return req().pipe(
			catchError((error: unknown) => {
				if(!(error instanceof HttpErrorResponse)) return observableThrowError(() => error);
				if(refresh === true && error.status === 401) {
					return this.refreshRequest.pipe(
						switchMap(() => req())
					);
				}
				if(error.status === 403) {
          this.router.navigate(["verify"]);
          return observableThrowError(() => error);
				}
				return observableThrowError(() => error);
			}),
		);
	}

	private getHeaders(): Headers {
		const accessToken = this.authService.getAccessToken();

		let headers = { ...this.headers};
		if(accessToken != null) headers = { ...headers, Authorization: `Bearer ${accessToken}` };

		return headers;
	}
}
