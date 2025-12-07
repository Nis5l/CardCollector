import { Component } from '@angular/core';
import { type Route } from '@angular/router';

import { TradeSelfInventoryComponent } from './trade-self-inventory';
import { TradeSelfTradeComponent } from './trade-self-trade';

const ROUTES: Route[] = [
  { path: "", pathMatch: "full", component: TradeSelfTradeComponent },
  { path: "inventory", component: TradeSelfInventoryComponent },
];

@Component({
    selector: "cc-trade-self",
    templateUrl: "./trade-self.component.html",
    styleUrls: ["./trade-self.component.scss"],
    standalone: false
})
export class TradeSelfComponent {
  constructor() {}

  public static getRoutes(): Route[] {
    return ROUTES;
  }
}
