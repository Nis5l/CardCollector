import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import type { UserResponse } from '../types';

@Component({
    selector: "cc-user",
    templateUrl: "./user.component.html",
    styleUrls: ["./user.component.scss"],
    standalone: false
})
export class UserComponent {
  private _userResponse: UserResponse | null = null;

  @Input()
  public set userResponse(usersResponse: UserResponse) {
    this._userResponse = usersResponse;
  }

  public get userResponse(): UserResponse {
    if(this._userResponse == null) throw new Error("userResponse not set");
    return this._userResponse;
  }

  constructor(private readonly router: Router) {}

  public userClick(): void {
    this.router.navigate(["user", this.userResponse.id]);
  }
}
