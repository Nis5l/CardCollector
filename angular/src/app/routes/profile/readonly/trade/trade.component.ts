import { Component } from '@angular/core';
import { type Route } from '@angular/router';

import type { NavigationItem } from '../../../../shared/components';
import { TradeSelfComponent } from './trade-self';
import { TradeFriendComponent } from './trade-friend';

const ROUTES: Route[] = [
  { path: "", pathMatch: "full", redirectTo: "you" },
  { path: "you", component: TradeSelfComponent, children: TradeSelfComponent.getRoutes() },
  { path: "friend", component: TradeFriendComponent, children: TradeFriendComponent.getRoutes() },
];

@Component({
  selector: "cc-profile-trade",
  templateUrl: "./trade.component.html",
  styleUrls: [ "./trade.component.scss" ],
})
export class TradeComponent {
  public readonly navigationItems: NavigationItem[] = [
    { name: "You", link: "./you", icon: "person" },
    { name: "Friend", link: "./friend", icon: "person" },
  ];

  constructor() {}

  public static getRoutes(): Route[] {
    return ROUTES;
  }
}
