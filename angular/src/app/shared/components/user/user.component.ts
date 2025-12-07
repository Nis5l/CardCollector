import { Component, Input } from '@angular/core';
import { Observable, BehaviorSubject, filter, switchMap } from 'rxjs';

import type { Id } from '../../types';
import { UserService } from '../../services';

@Component({
    selector: 'cc-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: false
})
export class UserComponent {
	private readonly userIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
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
		return id;
	}

	constructor(private readonly userService: UserService) {
		this.userId$ = this.userIdSubject.asObservable().pipe(
			filter((userId): userId is Id => userId != null)
		);

		this.username$ = this.userId$.pipe(
			switchMap(userId => this.userService.getUsernameById(userId))
		);
	}

	public navigateUser(userId: Id): void {
		this.userService.navigateUser(userId);
	}
}
