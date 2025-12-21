import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

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
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        const last = this.history[this.history.length - 1];
        if (last !== url) {
          this.history.push(url);
        }
      }
    }));
  }

  public canGoBack(): boolean {
    return this.history.length > 1;
  }

  public goBack(): void {
    if (!this.canGoBack()) return;
    this.location.back();
  }
}
