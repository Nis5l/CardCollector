import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import type { PageEvent } from '@angular/material/paginator';
import { Observable, map, combineLatest, BehaviorSubject, startWith, debounceTime, distinctUntilChanged, switchMap, share, tap } from 'rxjs';

import type { Id } from '../../../../shared/types';
import { CardSortType, CardIndexResponse } from '../../../../shared/types';
import { CardService } from '../../../../shared/services';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';

@Component({
    selector: "cc-collector-catalog",
    templateUrl: "./collector-catalog.component.html",
    styleUrls: ["./collector-catalog.component.scss"],
    standalone: false
})
export class CollectorCatalogComponent extends SubscriptionManagerComponent {
  public readonly formGroup: FormGroup;

  public readonly sortTypes: { text: string, value: CardSortType }[] = [
    {
      text: "Name",
      value: CardSortType.Name,
    },
    {
      text: "Card Type",
      value: CardSortType.CardType,
    },
    {
      text: "Recent",
      value: CardSortType.Recent,
    },
  ];

  public readonly cardIndexResponseSubject: BehaviorSubject<CardIndexResponse>;
  public readonly cardIndexResponse$: Observable<CardIndexResponse>;

	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

	private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public readonly loading$: Observable<boolean>;

  constructor(activatedRoute: ActivatedRoute, cardService: CardService) {
    super();

    const searchFormControl = new FormControl("", { nonNullable: true });

    const sortTypeDefaultValue: CardSortType = this.sortTypes[0].value;
    const sortTypeFormControl = new FormControl(sortTypeDefaultValue, { nonNullable: true });

    this.formGroup = new FormGroup({
      search: searchFormControl,
      sortType: sortTypeFormControl
    });

    const params$ = activatedRoute.parent?.params ?? activatedRoute.params;

    const collectorId$: Observable<Id> = params$.pipe(
      map(params => {
        const collectorId: unknown = params["collectorId"];
        if(typeof collectorId !== "string") throw new Error("collectorId param not set");
        return collectorId;
      }),
    );

    const loadingCardIndexResponse: CardIndexResponse = { cards: [], cardCount: 0, page: 0, pageSize: 0 };
    this.cardIndexResponseSubject = new BehaviorSubject(loadingCardIndexResponse);
    this.cardIndexResponse$ = this.cardIndexResponseSubject.asObservable();

    this.registerSubscription(combineLatest([
      collectorId$,
      this.pageSubject.asObservable(),
      searchFormControl.valueChanges.pipe(
          startWith(""),
          debounceTime(300),
          distinctUntilChanged()
      ),
      sortTypeFormControl.valueChanges.pipe(startWith(sortTypeDefaultValue))
    ]).pipe(
      tap(() => {
        this.loadingSubject.next(true);
        this.cardIndexResponseSubject.next(loadingCardIndexResponse);
      }),
      switchMap(([collectorId, page, search, sortType]) => cardService.getCards(collectorId, search, page, null, sortType).pipe(share()))
    ).subscribe(res => {
      this.loadingSubject.next(false);
      this.cardIndexResponseSubject.next(res);
    }));

		this.loading$ = this.loadingSubject.asObservable();
  }

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}
}
