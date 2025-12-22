import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged, combineLatest, startWith, switchMap, tap, filter, shareReplay } from 'rxjs';
import type { PageEvent } from '@angular/material/paginator';

import { CardService } from '../../services';
import { SubscriptionManagerComponent } from '../../abstract';
import type { Id, Card, CardIndexResponse } from '../../types';
import { CardSortType } from '../../types';

@Component({
    selector: "cc-card-list",
    templateUrl: "./card-list.component.html",
    styleUrls: ["./card-list.component.scss"],
    standalone: false
})
export class CardListComponent extends SubscriptionManagerComponent {
  @Input()
  public click: "none" | "navigate" | "event" = "none";

  @Output()
  public readonly onClick: EventEmitter<Card> = new EventEmitter<Card>();

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

  private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
  private readonly collectorId$: Observable<Id>;
  @Input()
  public set collectorId(id: Id | null | undefined) {
    if(id == null) return;
    this.collectorIdSubject.next(id);
  }
  public get collectorId(): Id {
    const id = this.collectorIdSubject.getValue();
    if(id == null) throw new Error("collectorId not set");
    return id;
  }

  constructor(cardService: CardService) {
    super();

    const searchFormControl = new FormControl("", { nonNullable: true });

    const sortTypeDefaultValue: CardSortType = this.sortTypes[0].value;
    const sortTypeFormControl = new FormControl(sortTypeDefaultValue, { nonNullable: true });

    this.formGroup = new FormGroup({
      search: searchFormControl,
      sortType: sortTypeFormControl
    });

    this.collectorId$ = this.collectorIdSubject.asObservable().pipe(
      filter((collectorId): collectorId is Id => collectorId != null)
    );

    const loadingCardIndexResponse: CardIndexResponse = { cards: [], cardCount: 0, page: 0, pageSize: 0 };
    this.cardIndexResponseSubject = new BehaviorSubject(loadingCardIndexResponse);
    this.cardIndexResponse$ = this.cardIndexResponseSubject.asObservable();

    this.registerSubscription(combineLatest([
      this.collectorId$,
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
      switchMap(([collectorId, page, search, sortType]) => cardService.getCards(collectorId, search, page, null, sortType).pipe(shareReplay()))
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
