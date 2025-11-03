import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { LoadingModule, CardModule } from '../../../../../../shared/components';
import { ConfirmationDialogModule, YesNoCancelDialogModule } from '../../../../../../shared/dialogs';
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
    ConfirmationDialogModule,
    YesNoCancelDialogModule,
  ],
  providers: [ TradeService ],
  declarations: [ TradeSelfTradeComponent ]
})
export class TradeSelfTradeModule {}
