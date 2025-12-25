import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, shareReplay, filter, map, BehaviorSubject } from 'rxjs';

import { CollectorAddCardTypeService } from './collector-add-card-type.service';
import type { Id, CardTypeConfig } from '../../../../../shared/types';
import { LoadingService, CardService } from '../../../../../shared/services';
import { HttpErrorResponse } from '@angular/common/http';

type CollectorAddCardTypeFormGroup = FormGroup<{
  name: FormControl<string>
}>;

@Component({
    selector: 'cc-collector-add-card-type',
    templateUrl: './collector-add-card-type.component.html',
    styleUrls: ['./collector-add-card-type.component.scss'],
    standalone: false
})
export class CollectorAddCardTypeComponent {
	@Output()
	public readonly onClose: EventEmitter<void> = new EventEmitter<void>();

	private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
	public readonly collectorId$: Observable<Id>;

	@Input()
	public set collectorId(id: Id | null | undefined) {
    if(id == null) return;
    this.collectorIdSubject.next(id);
	}

	public get collectorId(): Id {
    const collectorId = this.collectorIdSubject.getValue();
		if(collectorId == null) throw new Error("collectorId not set");
		return collectorId;
	}

	public readonly config$: Observable<CardTypeConfig>;
	public readonly formGroup$: Observable<CollectorAddCardTypeFormGroup>;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(
    private readonly collectorAddCardTypeService: CollectorAddCardTypeService,
    private readonly loadingService: LoadingService,
    private readonly cardService: CardService
  ) {
		this.config$ = this.cardService.getCardTypeConfig().pipe(shareReplay(1));

		this.formGroup$ = this.config$.pipe(
      map(config => new FormGroup({
        name: new FormControl("", {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.pattern("^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$"),
            Validators.minLength(config.nameLengthMin),
            Validators.maxLength(config.nameLengthMax),
          ]
        })
      })
    ));

    this.collectorId$ = this.collectorIdSubject.pipe(
      filter((collectorId): collectorId is Id => collectorId != null)
    );

		this.error$ = this.errorSubject.asObservable();
	}

	public createCardTypeRequest(collectorId: Id, formGroup: CollectorAddCardTypeFormGroup): void {
		this.loadingService.waitFor(this.collectorAddCardTypeService.createCollectorRequest(collectorId, formGroup.getRawValue())).subscribe({
			next: () => { this.onClose.emit() },
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Creating request failed");
			}
		})
	}
}
