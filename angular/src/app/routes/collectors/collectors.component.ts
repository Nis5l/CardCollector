import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, BehaviorSubject, startWith, combineLatest as observableCombibeLatest } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import type { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';

import { CollectorsService } from './collectors.service';
import { NewCollectorDialogComponent } from './new-collector-dialog';
import type { CollectorsIndexResponse } from './types';

import { SubscriptionManagerComponent } from '../../shared/abstract';

@Component({
	selector: 'cc-collectors',
	templateUrl: './collectors.component.html',
	styleUrls: [ './collectors.component.scss' ]
})
export class CollectorsComponent extends SubscriptionManagerComponent {
	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly collectorsIndexResponseDefault: CollectorsIndexResponse = { collectors: [], collectorCount: 0, page: 0, pageSize: 0 };

	private readonly collectorIndexResponseSubject: BehaviorSubject<CollectorsIndexResponse> = new BehaviorSubject<CollectorsIndexResponse>(this.collectorsIndexResponseDefault);
	public readonly collectorIndexResponse$: Observable<CollectorsIndexResponse>;

	public readonly formGroup;
	private readonly searchForm;

	public readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public readonly loading$: Observable<boolean>;

	constructor(
		private readonly collectorsService: CollectorsService,
		private readonly matDialog: MatDialog,
	) {
		super();
		this.collectorIndexResponse$ = this.collectorIndexResponseSubject.asObservable();
		this.loading$ = this.loadingSubject.asObservable();

		this.searchForm = new FormControl("", { nonNullable: true });
		this.registerSubscription(observableCombibeLatest([
			this.searchForm.valueChanges.pipe(
				startWith(this.searchForm.value),
				debounceTime(500),
				distinctUntilChanged(),
			),
			this.pageSubject.asObservable()
		]).subscribe(([search, page]) => {
				this.loadCollectors(search, page);
			})
		);

		this.formGroup = new FormGroup({
			search: this.searchForm
		});
	}

	public newCollector(): void {
		NewCollectorDialogComponent.open(this.matDialog);
	}

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}

	private loadCollectors(search: string, page: number): void {
		//TODO: rewrite if this can be solved using waitFor
		this.loadingSubject.next(true);
    this.collectorIndexResponseSubject.next(this.collectorsIndexResponseDefault);
		this.registerSubscription(
			this.collectorsService.getCollectors(search, page).subscribe(collectorIndexResponse => {
				this.collectorIndexResponseSubject.next(collectorIndexResponse);
				this.loadingSubject.next(false);
			})
		);
	}
}
