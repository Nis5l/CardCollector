import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LoadingModule, CardModule } from '../../../../../../shared/components';
import { YesNoCancelDialogModule } from '../../../../../../shared/dialogs';
import { NgVarModule } from '../../../../../../shared/directives';
import { HttpModule } from '../../../../../../shared/services';
import { TradeSelfTradeComponent } from './trade-self-trade.component';
import { TradeService } from '../../trade.service';

const MATERIAL_MODULES = [
  MatDialogModule,
	MatButtonModule,
	MatIconModule,
  MatTooltipModule,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    ...MATERIAL_MODULES,

    HttpModule,
    LoadingModule,
    CardModule,
    NgVarModule,
    YesNoCancelDialogModule,
  ],
  providers: [ TradeService ],
  declarations: [ TradeSelfTradeComponent ]
})
export class TradeSelfTradeModule {}
