import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TradeSelfComponent } from './trade-self.component';
import { LoadingService } from '../../../../../shared/services';
import { TradeSelfInventoryModule } from './trade-self-inventory';
import { TradeSelfTradeModule } from './trade-self-trade';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    TradeSelfInventoryModule,
    TradeSelfTradeModule,
  ],
  //TODO: split for self and friend
  providers: [ LoadingService ],
  declarations: [ TradeSelfComponent ]
})
export class TradeSelfModule {}
