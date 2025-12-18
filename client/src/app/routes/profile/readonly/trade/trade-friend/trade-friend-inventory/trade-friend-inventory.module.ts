import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { HttpModule, AuthModule } from '../../../../../../shared/services';
import { InventoryModule } from '../../../../../../shared/components/inventory';
import { YesNoCancelDialogModule } from '../../../../../../shared/dialogs';
import { TradeFriendInventoryComponent } from './trade-friend-inventory.component';
import { TradeFriendInventoryService } from './trade-friend-inventory.service';
import { TradeService } from '../../trade.service';

const MATERIAL_MODULES = [
  MatDialogModule,
	MatButtonModule,
	MatIconModule,
];

@NgModule({
  imports: [
    CommonModule,

    ...MATERIAL_MODULES,

    HttpModule,
    AuthModule,
    InventoryModule,
    YesNoCancelDialogModule,
  ],
  providers: [ TradeFriendInventoryService, TradeService ],
  declarations: [ TradeFriendInventoryComponent ]
})
export class TradeFriendInventoryModule {}
