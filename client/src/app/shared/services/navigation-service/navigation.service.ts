import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';

import { SubscriptionManagerComponent } from '../../abstract';

@Injectable({ providedIn: 'root' })
export class NavigationService extends SubscriptionManagerComponent {
  private history: string[] = [];

  constructor(
    private router: Router,
    private readonly location: Location,
  ) {
    super();

    this.registerSubscription(this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.history.push(event.url);
      }
    }));
  }

  public canGoBack(): boolean {
    return this.history.length > 1;
  }

  public goBack(defaultUrl: string = '/'): void {
    if (!this.canGoBack()) return;
    this.location.back();
  }
}
