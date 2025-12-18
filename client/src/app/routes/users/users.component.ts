import { Component } from '@angular/core';

import { SubscriptionManagerComponent } from '../../shared/abstract';

@Component({
    selector: "cc-users",
    templateUrl: "./users.component.html",
    styleUrls: ["./users.component.scss"],
    standalone: false
})
export class UsersComponent extends SubscriptionManagerComponent {
  constructor() {
    super();
  }
}
