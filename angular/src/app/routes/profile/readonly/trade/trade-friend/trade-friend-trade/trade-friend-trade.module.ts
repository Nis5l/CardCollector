import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

import { LoadingModule, CardModule } from '../../../../../../shared/components';
import { ConfirmationDialogModule } from '../../../../../../shared/dialogs';
import { NgVarModule } from '../../../../../../shared/directives';
import { HttpModule } from '../../../../../../shared/services';
import { TradeFriendTradeComponent } from './trade-friend-trade.component';

const MATERIAL_MODULES = [
  MatDialogModule,
	MatButtonModule,
	MatIconModule,
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
  ],
  providers: [ ],
  declarations: [ TradeFriendTradeComponent ]
})
export class TradeFriendTradeModule {}
