import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, EMPTY, map, shareReplay, filter, switchMap, tap, catchError } from 'rxjs';

import { ForgotResetService } from './forgot-reset.service';

import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { LoadingService } from '../../../../shared/services';
import { AdmissionService, AdmissionConfig } from '../../admission-service';

type ForgotResetFormGroup = FormGroup<{
  password: FormControl<string>,
  passwordRepeat: FormControl<string>,
}>;

@Component({
    selector: "cc-forgot-reset",
    templateUrl: "./forgot-reset.component.html",
    styleUrls: ["./forgot-reset.component.scss"],
    standalone: false
})
export class ForgotResetComponent extends SubscriptionManagerComponent {
	public readonly config$: Observable<AdmissionConfig>;
	public readonly formGroup$: Observable<ForgotResetFormGroup>;
	public readonly key$: Observable<string>;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

  //TODO: share with register
	private readonly passwordRepeatValidator: ValidatorFn = (fg: AbstractControl): ValidationErrors | null => {
		let password = fg.parent?.get("password")?.value;
		let passwordRepeat = fg.value;
		return password === passwordRepeat ? null : { passwordNotSame: true };
	};

	constructor(
		private readonly forgotResetService: ForgotResetService,
		private readonly admissionService: AdmissionService,
    route: ActivatedRoute,
		private readonly router: Router,
		private readonly loadingService: LoadingService
	) {
		super();

    this.config$ = this.admissionService.getConfig().pipe(
      shareReplay(1)
    );

		this.formGroup$ = this.loadingService.waitFor(this.config$.pipe(
      map(config => new FormGroup({
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
        })
      }))
    ));

    this.key$ = route.paramMap.pipe(
      map(params => params.get('key')),
      tap(key => {
        if (key == null) {
          console.error("somehow key not set");
          this.router.navigate(['/']);
        }
      }),
      filter((key): key is string => key != null),
      shareReplay(1)
    );

    this.registerSubscription(
      this.key$.pipe(
        switchMap(key => this.forgotResetService.check(key).pipe(
          catchError(() => {
            this.router.navigate(['/']);
            return EMPTY;
          }),
        )),
      ).subscribe()
    );

		this.error$ = this.errorSubject.asObservable();
	}

	public reset(key: string, formGroup: ForgotResetFormGroup): void {
		const { password, passwordRepeat} = formGroup.getRawValue();
    if(password != passwordRepeat) throw new Error("passwords dont match");

		this.errorSubject.next(null);

		this.registerSubscription(
			this.loadingService.waitFor(this.forgotResetService.reset({ key, password })).subscribe({
				next: () => {
					this.errorSubject.next(null);
					this.router.navigate(["login"]);
				},
				error: (err: HttpErrorResponse) => {
					this.errorSubject.next(err.error?.error ?? "Password reset failed");
				}
			})
		);
	}
}
