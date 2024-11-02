import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Notification } from '../types';

@Component({
	selector: 'cc-notification-item',
	templateUrl: './notification-item.component.html',
	styleUrls: ["./notification-item.component.scss"]
})
export class NotificationItemComponent{
	@Input() public notification: Notification | null = null;
  @Output() public onClick = new EventEmitter<Notification>();

  constructor() {}
}
