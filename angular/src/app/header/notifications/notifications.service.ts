import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';

import { HttpService } from '../../shared/services';

import type { IdInt } from '../../shared/types';
import type { Notification } from './types';


@Injectable()
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
	constructor(private httpService: HttpService){}

	public getNotifications(): Observable<Notification[]>{
    this.refreshNotifications();
    return this.notificationsSubject.asObservable();
	}

  public deleteNotification(notificationId: IdInt): Observable<unknown> {
    return this.httpService.post(`/notifications/delete/${notificationId}`, {}).pipe(
      tap(() => this.refreshNotifications())
    );
  }

  private refreshNotifications(): void {
    this.httpService.get<Notification[]>('/notifications').subscribe(
      notifications => this.notificationsSubject.next(notifications)
    );
  }
}
