import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

import { ForgotSendService } from './forgot-send.service';

import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { LoadingService } from '../../../../shared/services';

type ForgotFormGroup = FormGroup<{
  usernameOrEmail: FormControl<string>,
}>;

@Component({
    selector: "cc-forgot-send",
    templateUrl: "./forgot-send.component.html",
    styleUrls: ["./forgot-send.component.scss"],
    standalone: false
})
export class ForgotSendComponent extends SubscriptionManagerComponent {
	public readonly formGroup: ForgotFormGroup;

  private readonly messageSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public readonly message$: Observable<string | null>;


	constructor(
		private readonly forgotService: ForgotSendService,
		private readonly loadingService: LoadingService
	) {
		super();
		this.formGroup = new FormGroup({
      usernameOrEmail: new FormControl("", {
        nonNullable: true,
        validators: [
          Validators.required,
        ]
      }),
    });

    this.message$ = this.messageSubject.asObservable();
	}

  public forgot(): void {
    this.messageSubject.next(null);

    this.registerSubscription(this.loadingService.waitFor(this.forgotService.forgot(this.formGroup.getRawValue())).subscribe(
      ({ message }) => this.messageSubject.next(message)
    ));
  }
}
