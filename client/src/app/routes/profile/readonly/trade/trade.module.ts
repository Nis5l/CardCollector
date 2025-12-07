import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TradeService } from './trade.service';
import { TradeComponent } from './trade.component';
import { HttpModule } from '../../../../shared/services';
import { TradeSelfModule } from './trade-self';
import { TradeFriendModule } from './trade-friend';
import { TabNavigationModule } from '../../../../shared/components';
import { NgVarModule } from '../../../../shared/directives';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    HttpModule,
    TradeSelfModule,
    TradeFriendModule,
    TabNavigationModule,
    NgVarModule,
  ],
  providers: [ TradeService ],
  declarations: [ TradeComponent ],
})
export class TradeModule {}
