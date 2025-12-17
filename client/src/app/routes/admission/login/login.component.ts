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
	public readonly formGroup: LoginFormGroup;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(
		private readonly loginService: LoginService,
		private readonly router: Router,
		private readonly loadingService: LoadingService
	) {
		super();
		this.formGroup = new FormGroup({
      username: new FormControl("", {
        nonNullable: true,
        validators: [
          Validators.required,
        ]
      }),
      password: new FormControl("", {
        nonNullable: true,
        validators: [
          Validators.required,
        ]
      }),
    });

		this.error$ = this.errorSubject.asObservable();
	}

	public login(): void {
		this.errorSubject.next(null);

		this.registerSubscription(
			this.loadingService.waitFor(this.loginService.login(this.formGroup.getRawValue())).subscribe({
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
