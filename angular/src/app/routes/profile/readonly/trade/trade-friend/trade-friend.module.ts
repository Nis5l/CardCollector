import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TradeFriendComponent } from './trade-friend.component';
import { CardModule } from '../../../../../shared/components';
import { TradeFriendTradeModule } from './trade-friend-trade';
import { TradeFriendInventoryModule } from './trade-friend-inventory';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    CardModule,
    TradeFriendTradeModule,
    TradeFriendInventoryModule,
  ],
  declarations: [ TradeFriendComponent ]
})
export class TradeFriendModule {}
