import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, combineLatest as observableCombineLatest, map, Observable, shareReplay } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { CollectorService } from '../collector.service';
import type { CollectorConfig } from '../types';
import { LoadingService } from '../../../shared/services';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import type { Collector, Id } from '../../../shared/types';

type LocalFormGroup = FormGroup<{
  name: FormControl<string>,
  description: FormControl<string>
}>;

@Component({
    selector: "cc-collector-edit",
    templateUrl: "./collector-edit.component.html",
    styleUrls: ["./collector-edit.component.scss"],
    standalone: false
})
export class CollectorEditComponent extends SubscriptionManagerComponent {
	public readonly collector$: Observable<Collector>;

  public config$: Observable<CollectorConfig>;
  public formGroup$: Observable<LocalFormGroup>;

	constructor(
		private readonly collectorService: CollectorService,
		private readonly router: Router,
		activatedRoute: ActivatedRoute,
		loadingService: LoadingService
	) {
		super();

    this.config$ = this.collectorService.getConfig().pipe(shareReplay(1));

		this.collector$ = loadingService.waitFor(activatedRoute.params.pipe(
			switchMap(params => {
				const collectorId = params["collectorId"] as unknown;
				if(typeof collectorId !== "string") {
					throw new Error("collectorId is not a string");
				}

				return this.collectorService.getCollector(collectorId);
			}),
      shareReplay({ bufferSize: 1, refCount: true })
		));

		this.formGroup$ = observableCombineLatest([this.config$, this.collector$]).pipe(
      map(([config, collector]) => new FormGroup({
          name: new FormControl(collector.name, {
            nonNullable: true,
            validators: [ Validators.required, Validators.minLength(config.name.minLength), Validators.maxLength(config.name.maxLength) ]
          }),
          description: new FormControl(collector.description, {
            nonNullable: true,
            validators: [ Validators.required, Validators.minLength(config.description.minLength), Validators.maxLength(config.description.maxLength) ]
          })
        })
       ),
    );
	}

	public navigateCollector(collectorId: Id | undefined): void {
		if(collectorId == null) this.router.navigate(["home"]);
		this.router.navigate(["collector", collectorId]);
	}

  public hasChanges(formGroup: LocalFormGroup): boolean {
    return formGroup.dirty;
  }

  public saveChanges(collectorId: Id, formGroup: LocalFormGroup) {
    if (!this.hasChanges) return;

    const rawValue = formGroup.getRawValue();

    this.collectorService.updateCollector({
      id: collectorId,
      name: rawValue.name,
      description: rawValue.description
    }).subscribe(() => {
      formGroup.markAsPristine();
    });
  }
}
