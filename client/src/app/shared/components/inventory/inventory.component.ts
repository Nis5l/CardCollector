import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import type { PageEvent } from '@angular/material/paginator';
import { Observable, BehaviorSubject, tap, combineLatest as observableCombineLatest, catchError, of as observableOf, switchMap, startWith, debounceTime, distinctUntilChanged, share, filter } from 'rxjs';

import { InventoryService } from './inventory.service';
import { SortType } from './types';
import { SubscriptionManagerComponent } from '../../abstract';
import type { InventoryResponse, Id } from '../../types';

@Component({
    selector: "cc-inventory",
    templateUrl: "./inventory.component.html",
    styleUrls: ["./inventory.component.scss"],
    standalone: false
})
export class InventoryComponent extends SubscriptionManagerComponent {
  private readonly userIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
  @Input()
  public set userId(userId: Id | null) {
    this.userIdSubject.next(userId);
  }
  public get userId(): Id {
    const userId = this.userIdSubject.getValue();
    if(userId == null) throw new Error("userId not set");
    return userId;
  }

  @Input()
  public input: boolean = true;

  private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
  @Input()
  public set collectorId(userId: Id | null) {
    this.collectorIdSubject.next(userId);
  }
  public get collectorId(): Id {
    const collectorId = this.collectorIdSubject.getValue();
    if(collectorId == null) throw new Error("collectorId not set");
    return collectorId;
  }

  @Input()
  public click: "none" | "upgrade" | "event" = "none";
  @Output()
  public readonly clickEvent: EventEmitter<Id> = new EventEmitter<Id>();

  public readonly excludeUuidsSubject: BehaviorSubject<Id[]> = new BehaviorSubject<Id[]>([]);
  @Input()
  public set excludeUuids(excludeUuids: Id[] | null) {
    this.excludeUuidsSubject.next(excludeUuids ?? []);
  }
  public get excludeUuids(): Id[] {
    return this.excludeUuidsSubject.getValue();
  }

  public readonly levelSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  @Input()
  public set level(level: number | null | undefined) {
    this.levelSubject.next(level ?? null);
  }
  public get level(): number | null | undefined {
    return this.levelSubject.getValue();
  }

  public readonly cardIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
  @Input()
  public set cardId(cardId: Id | null | undefined) {
    this.cardIdSubject.next(cardId ?? null);
  }
  public get cardId(): Id | null {
    return this.cardIdSubject.getValue();
  }

  public readonly inventoryResponseSubject: BehaviorSubject<InventoryResponse>;
  public readonly inventoryResponse$: Observable<InventoryResponse>;
	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public readonly formGroup: FormGroup;
  public readonly sortTypes: { text: string, value: SortType }[] = [
    {
      text: "Name",
      value: SortType.Name,
    },
    {
      text: "Card Type",
      value: SortType.CardType,
    },
    {
      text: "Level",
      value: SortType.Level,
    },
    {
      text: "Recent",
      value: SortType.Recent,
    },
  ];

	private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public readonly loading$: Observable<boolean>;

  constructor(
    private readonly inventoryService: InventoryService,
  ) {
    super();
    const userId$: Observable<Id> = this.userIdSubject.pipe(filter((userId): userId is Id => userId != null));
    const collectorId$: Observable<Id> = this.collectorIdSubject.pipe(filter((userId): userId is Id => userId != null));

    const searchFormControl = new FormControl("", { nonNullable: true });

    const sortTypeDefaultValue: SortType = this.sortTypes[0].value;
    const sortTypeFormControl = new FormControl(sortTypeDefaultValue, { nonNullable: true });

    this.formGroup = new FormGroup({
      search: searchFormControl,
      sortType: sortTypeFormControl
    });

    const loadingInventoryResponse: InventoryResponse = { cards: [], cardCount: 0, page: 0, pageSize: 0 };
    this.inventoryResponseSubject = new BehaviorSubject(loadingInventoryResponse);
    this.inventoryResponse$ = this.inventoryResponseSubject.asObservable();

		this.loading$ = this.loadingSubject.asObservable();

    this.registerSubscription(observableCombineLatest([
      userId$,
      collectorId$,
      this.pageSubject.asObservable(),
      searchFormControl.valueChanges.pipe(
        startWith(""),
        debounceTime(300),
        distinctUntilChanged()
      ),
      sortTypeFormControl.valueChanges.pipe(startWith(sortTypeDefaultValue)),
      this.excludeUuidsSubject.asObservable(),
      this.levelSubject.asObservable(),
      this.cardIdSubject.asObservable()
    ]).pipe(
      tap(() => {
        this.loadingSubject.next(true);
        this.inventoryResponseSubject.next(loadingInventoryResponse);
      }),
      switchMap(([userId, collectorId, page, search, sortType, excludeUuids, level, cardId]) => this.inventoryService.getInventory(userId, collectorId, page, search, sortType, excludeUuids, level, cardId).pipe(
        catchError(() => observableOf(loadingInventoryResponse)),
        share()
      ))
    ).subscribe(inventoryResponse => {
      this.loadingSubject.next(false);
      this.inventoryResponseSubject.next(inventoryResponse)
    }));
  }

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}
}
