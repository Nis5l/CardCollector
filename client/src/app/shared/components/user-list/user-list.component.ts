import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged, startWith, switchMap, combineLatest as observableCombineLatest, tap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import type { PageEvent } from '@angular/material/paginator';

import { UserListService } from './user-list.service';
import type { UsersResponse } from './types';
import { SubscriptionManagerComponent } from '../../abstract';
import type { Id, User } from '../../types';
import { UserSortType } from '../../types';

@Component({
    selector: "cc-user-list",
    templateUrl: "./user-list.component.html",
    styleUrls: ["./user-list.component.scss"],
    standalone: false
})
export class UserListComponent extends SubscriptionManagerComponent {
  @Input()
  public click: "none" | "navigate" | "event" = "none";

  @Output()
  public readonly onClick: EventEmitter<User> = new EventEmitter<User>();

  public readonly excludeIdsSubject: BehaviorSubject<Id[]> = new BehaviorSubject<Id[]>([]);
  public readonly excludeIds$: Observable<Id[]>;

  @Input()
  public set excludeIds(ids: Id[] | null | undefined) {
    if(ids == null) return;
    this.excludeIdsSubject.next(ids);
  }
  public get excludeIds(): Id[] {
    return this.excludeIdsSubject.getValue();
  }

  public readonly sortTypes: { text: string, value: UserSortType }[] = [
    {
      text: "Name",
      value: UserSortType.Name,
    },
    {
      text: "Recent",
      value: UserSortType.Recent,
    },
    {
      text: "Most Cards",
      value: UserSortType.MostCards,
    },
  ];

  private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly defaultUsersResponse: UsersResponse = { users: [], page: 0, pageSize: 0, userCount: 0 };
  private readonly usersResponseSubject: BehaviorSubject<UsersResponse> = new BehaviorSubject<UsersResponse>(this.defaultUsersResponse);
  public readonly usersResponse$: Observable<UsersResponse>;

  private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public readonly loading$: Observable<boolean>;

  public readonly formGroup;

  constructor(private readonly usersService: UserListService) {
    super();
    const searchFormControl = new FormControl("", {
      nonNullable: true,
    });

    const defaultSortType = this.sortTypes[0].value;
    const sortTypeFormControl = new FormControl(defaultSortType, { nonNullable: true });
    this.formGroup = new FormGroup({
      search: searchFormControl,
      sortType: sortTypeFormControl
    });

    this.loading$ = this.loadingSubject.asObservable();

    this.usersResponse$ = this.usersResponseSubject.asObservable();

    this.excludeIds$ = this.excludeIdsSubject.asObservable();

    this.registerSubscription(observableCombineLatest([
      this.pageSubject.asObservable(),
      searchFormControl.valueChanges.pipe(
        startWith(searchFormControl.value),
				debounceTime(500),
				distinctUntilChanged(),
      ),
      this.excludeIds$,
      sortTypeFormControl.valueChanges.pipe(startWith(defaultSortType)),
    ]).pipe(
      switchMap(([page, search, excludeIds, sortType]) => {
        this.loadingSubject.next(true);
        this.usersResponseSubject.next(this.defaultUsersResponse);
        return this.usersService.getUsers(search, page, excludeIds, sortType);
      }),
      tap(() => this.loadingSubject.next(false))
    ).subscribe(usersResponse => this.usersResponseSubject.next(usersResponse)));
  }

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}
}
