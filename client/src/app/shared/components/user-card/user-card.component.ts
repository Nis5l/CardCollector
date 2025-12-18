import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, filter } from 'rxjs';

import type { User } from '../../types/user';

@Component({
    selector: "cc-user-card",
    templateUrl: "./user-card.component.html",
    styleUrls: ["./user-card.component.scss"],
    standalone: false
})
export class UserCardComponent {
  private readonly userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public readonly user$: Observable<User>;

  @Input()
  public set user(user: User | null | undefined) {
    if(user == null) return;
    this.userSubject.next(user);
  }
  public get user(): User {
    const user = this.userSubject.getValue();
    if(user == null) throw new Error("user not set");
    return user;
  }

  constructor(private readonly router: Router) {
    this.user$ = this.userSubject.pipe(
      filter((user): user is User => user != null)
    );
  }

  public userClick(user: User): void {
    this.router.navigate(["user", user.id]);
  }
}
