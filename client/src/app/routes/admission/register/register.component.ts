import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';

import { RegisterService } from './register.service';
import { AdmissionService } from '../admission-service';
import type { AdmissionConfig } from '../admission-service';

import { SubscriptionManagerComponent } from '../../../shared/abstract';
import { LoadingService } from '../../../shared/services';

type RegisterFormGroup = FormGroup<{
  username: FormControl<string>,
  email: FormControl<string>,
  password: FormControl<string>
  passwordRepeat: FormControl<string>
}>;

@Component({
    selector: 'cc-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: false
})
export class RegisterComponent extends SubscriptionManagerComponent {
	public readonly formGroup$: Observable<RegisterFormGroup>;
	public readonly config$: Observable<AdmissionConfig>;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	private readonly passwordRepeatValidator: ValidatorFn = (fg: AbstractControl): ValidationErrors | null => {
		let password = fg.parent?.get("password")?.value;
		let passwordRepeat = fg.value;
		return password === passwordRepeat ? null : { passwordNotSame: true };
	};

	constructor(
		private readonly registerService: RegisterService,
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
            //TODO: error in html
            Validators.pattern("^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$"),
            Validators.minLength(config.username.minLength),
            Validators.maxLength(config.username.maxLength)
          ]
        }),
        email: new FormControl("", {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.email
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
        passwordRepeat: new FormControl("", {
          nonNullable: true,
          validators: [
            Validators.required,
            this.passwordRepeatValidator
          ]
        }),
      }))
    ));

		this.error$ = this.errorSubject.asObservable();
	}

	public register(formGroup: RegisterFormGroup): void {
		this.errorSubject.next(null);

		const { passwordRepeat , ...config} = formGroup.getRawValue();

		this.registerSubscription(
			this.loadingService.waitFor(this.registerService.register(config)).subscribe({
				next: () => {
          this.errorSubject.next(null);
					this.router.navigate(["login"]);
				},
				error: (err: HttpErrorResponse) => {
					this.errorSubject.next(err.error?.error ?? "Register failed");
				}
			})
		);
	}
}
