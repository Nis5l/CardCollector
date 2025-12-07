import { Component } from '@angular/core';
import { type Route } from '@angular/router';

import { TradeFriendInventoryComponent } from './trade-friend-inventory';
import { TradeFriendTradeComponent } from './trade-friend-trade';

const ROUTES: Route[] = [
  { path: "", pathMatch: "full", component: TradeFriendTradeComponent },
  { path: "inventory", component: TradeFriendInventoryComponent },
];

@Component({
    selector: "cc-trade-friend",
    templateUrl: "./trade-friend.component.html",
    styleUrls: ["./trade-friend.component.scss"],
    standalone: false
})
export class TradeFriendComponent {
  public static getRoutes(): Route[] {
    return ROUTES;
  }
}
