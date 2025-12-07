import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

import { Popup } from '../../../shared/services/popup';

import { Notification } from '../types';
import { NotificationsService } from '../notifications.service';

import { SubscriptionManagerComponent } from '../../../shared/abstract';

@Component({
    selector: 'cc-notifications-list',
    templateUrl: './notifications-list.component.html',
    styleUrls: ["./notifications-list.component.scss"],
    standalone: false
})
export class NotificationsListComponent extends SubscriptionManagerComponent implements Popup {
  @Output() public onClick = new EventEmitter<Notification>();
	private readonly notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
	public readonly notifications$: Observable<Notification[]>;

	constructor(
	  private notificationsService: NotificationsService,
    private router: Router,
	){
		super();
		this.notifications$ = this.notificationsSubject.asObservable();
	}

	public onOpen(): void {
		this.registerSubscription(
			this.notificationsService.getNotifications().subscribe((notifications: Notification[]) => {
				this.notificationsSubject.next(notifications);
			})
		);
	}

  public navigate(notification: Notification): void {
    this.registerSubscription(this.notificationsService.deleteNotification(notification.id).subscribe(() => {
      this.router.navigate([notification.url]);
    }));
  }

	public onClose(){
	}
}
