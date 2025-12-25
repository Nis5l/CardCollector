import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, BehaviorSubject, switchMap, startWith, combineLatest as observableCombibeLatest, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import type { PageEvent } from '@angular/material/paginator';

import { CollectorsService } from './collectors.service';
import { NewCollectorDialogComponent } from './new-collector-dialog';
import type { CollectorsIndexResponse } from './types';
import { CollectorSortType } from './types';

import { SubscriptionManagerComponent } from '../../shared/abstract';

@Component({
    selector: 'cc-collectors',
    templateUrl: './collectors.component.html',
    styleUrls: ['./collectors.component.scss'],
    standalone: false
})
export class CollectorsComponent extends SubscriptionManagerComponent {
	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly collectorsIndexResponseDefault: CollectorsIndexResponse = { collectors: [], collectorCount: 0, page: 0, pageSize: 0 };

	private readonly collectorIndexResponseSubject: BehaviorSubject<CollectorsIndexResponse> = new BehaviorSubject<CollectorsIndexResponse>(this.collectorsIndexResponseDefault);
	public readonly collectorIndexResponse$: Observable<CollectorsIndexResponse>;

	public readonly formGroup;
	private readonly searchForm;

	private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public readonly loading$: Observable<boolean>;

  public readonly sortTypes: { text: string, value: CollectorSortType }[] = [
    {
      text: "Name",
      value: CollectorSortType.Name,
    },
    {
      text: "Recent",
      value: CollectorSortType.Recent,
    },
    {
      text: "Most Cards",
      value: CollectorSortType.MostCards,
    },
    {
      text: "Most Users",
      value: CollectorSortType.MostUsers,
    },
  ];

	constructor(
		private readonly collectorsService: CollectorsService,
		private readonly matDialog: MatDialog,
	) {
		super();

		this.searchForm = new FormControl("", { nonNullable: true });
    const defaultSortType = this.sortTypes[0].value;
    const sortTypeFormControl = new FormControl(defaultSortType, { nonNullable: true });
		this.formGroup = new FormGroup({
			search: this.searchForm,
      sortType: sortTypeFormControl
		});

		this.collectorIndexResponse$ = this.collectorIndexResponseSubject.asObservable();
		this.loading$ = this.loadingSubject.asObservable();

		this.registerSubscription(observableCombibeLatest([
			this.searchForm.valueChanges.pipe(
				startWith(this.searchForm.value),
				debounceTime(500),
				distinctUntilChanged(),
			),
			this.pageSubject.asObservable(),
      sortTypeFormControl.valueChanges.pipe(startWith(defaultSortType)),
		]).pipe(
      tap(() => {
        this.loadingSubject.next(true);
        this.collectorIndexResponseSubject.next(this.collectorsIndexResponseDefault);
      }),
      switchMap(([search, page, sortType]) => this.collectorsService.getCollectors(search, page, sortType))
		).subscribe(collectorIndexResponse => {
				this.collectorIndexResponseSubject.next(collectorIndexResponse);
				this.loadingSubject.next(false);
    }));
	}

	public newCollector(): void {
		NewCollectorDialogComponent.open(this.matDialog);
	}

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}
}
