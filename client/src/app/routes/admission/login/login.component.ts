import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, shareReplay, map } from 'rxjs';

import { LoginService } from './login.service';
import { AdmissionService } from '../admission-service';
import type { AdmissionConfig } from '../admission-service';

import { SubscriptionManagerComponent } from '../../../shared/abstract';
import { LoadingService } from '../../../shared/services';

type LoginFormGroup = FormGroup<{
  username: FormControl<string>,
  password: FormControl<string>
}>;

@Component({
    selector: "cc-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
    standalone: false
})
export class LoginComponent extends SubscriptionManagerComponent {
	public readonly formGroup$: Observable<LoginFormGroup>;
	public readonly config$: Observable<AdmissionConfig>;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(
		private readonly loginService: LoginService,
		private readonly router: Router,
		private readonly admissionService: AdmissionService,
		private readonly loadingService: LoadingService
	) {
		super();
		this.config$ = this.admissionService.getConfig().pipe(shareReplay(1));
		this.formGroup$ = this.loadingService.waitFor(this.config$.pipe(
      map(config => new FormGroup({
        username: new FormControl("", {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.minLength(config.username.minLength),
            Validators.maxLength(config.username.maxLength)
          ]
        }),
        password: new FormControl("", {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.minLength(config.password.minLength),
            Validators.maxLength(config.password.maxLength)
          ]
        }),
      })
    )));

		this.error$ = this.errorSubject.asObservable();
	}

	public login(formGroup: LoginFormGroup): void {
		this.registerSubscription(
			this.loadingService.waitFor(this.loginService.login(formGroup.getRawValue())).subscribe({
				next: () => {
					this.errorSubject.next(null);
					this.router.navigate(["collectors"]);
				},
				error: (err: HttpErrorResponse) => {
					this.errorSubject.next(err.error?.error ?? "Login failed");
				}
			})
		);
	}
}
