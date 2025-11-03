import { Component } from '@angular/core';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged, startWith, switchMap, combineLatest as observableCombineLatest, tap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import type { PageEvent } from '@angular/material/paginator';

import { UsersService } from './users.service';
import type { UsersResponse } from './types';
import { SubscriptionManagerComponent } from '../../shared/abstract';

@Component({
  selector: "cc-users",
  templateUrl: "./users.component.html",
  styleUrls: [ "./users.component.scss" ],
})
export class UsersComponent extends SubscriptionManagerComponent {
  private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly defaultUsersResponse: UsersResponse = { users: [], page: 0, pageSize: 0, userCount: 0 };
  private readonly usersResponseSubject: BehaviorSubject<UsersResponse> = new BehaviorSubject<UsersResponse>(this.defaultUsersResponse);
  public readonly usersResponse$: Observable<UsersResponse>;

  private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public readonly loading$: Observable<boolean>;

  public readonly formGroup;

  constructor(private readonly usersService: UsersService) {
    super();
    const searchFormControl = new FormControl("", {
      nonNullable: true,
    });
    this.formGroup = new FormGroup({
      search: searchFormControl,
    });

    this.loading$ = this.loadingSubject.asObservable();

    this.usersResponse$ = this.usersResponseSubject.asObservable();

    this.registerSubscription(observableCombineLatest([
      this.pageSubject.asObservable(),
      searchFormControl.valueChanges.pipe(
        startWith(searchFormControl.value),
				debounceTime(500),
				distinctUntilChanged(),
      )
    ]).pipe(
      switchMap(([page, search]) => {
        this.loadingSubject.next(true);
        this.usersResponseSubject.next(this.defaultUsersResponse);
        return this.usersService.getUsers(search, page);
      }),
      tap(() => this.loadingSubject.next(false))
    ).subscribe(usersResponse => this.usersResponseSubject.next(usersResponse)));
  }

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}
}
