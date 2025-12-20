import { Component, Input } from '@angular/core';
import { Observable, BehaviorSubject, filter, switchMap, map, of as observableOf } from 'rxjs';

import type { Id } from '../../types';
import type { User } from '../../types/user';
import { UserService } from '../../services';

@Component({
    selector: 'cc-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: false
})
export class UserComponent {
	private readonly userIdSubject: BehaviorSubject<Id | User | null> = new BehaviorSubject<Id | User | null>(null);
	public readonly userId$: Observable<Id>;
	public readonly username$: Observable<string>;

	@Input()
	public set userId(id: Id | null | undefined) {
		if(id == null) return;
		this.userIdSubject.next(id);
	}

	public get userId(): Id {
		const id = this.userIdSubject.getValue();
		if(id == null) throw new Error("userId not set");
    if(this.isUser(id)) return id.id;
		return id;
	}

	@Input()
	public set user(id: User | null | undefined) {
		if(id == null) return;
		this.userIdSubject.next(id);
	}

	public get user(): User {
		const user = this.userIdSubject.getValue();
		if(user == null || !this.isUser(user)) throw new Error("user not set");
		return user;
	}

	constructor(private readonly userService: UserService) {
    const userOrId$: Observable<User | Id> = this.userIdSubject.asObservable().pipe(
			filter((userOrId): userOrId is Id | User => userOrId != null),
    );

		this.userId$ = userOrId$.pipe(
      map(userOrId => this.isUser(userOrId) ? userOrId.id : userOrId),
		);

		this.username$ = userOrId$.pipe(
			switchMap(userOrId => this.isUser(userOrId) ? observableOf(userOrId.username) : this.userService.getUsernameById(userOrId))
		);
	}

	public navigateUser(userId: Id): void {
		this.userService.navigateUser(userId);
	}

  public isUser(user: Id | User): user is User {
    return typeof user === "object" &&  "id" in user;
  }
}
