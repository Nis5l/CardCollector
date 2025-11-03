import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

import { HttpModule, AuthModule } from '../../../../../../shared/services';
import { InventoryModule } from '../../../../../../shared/components/inventory';
import { ConfirmationDialogModule } from '../../../../../../shared/dialogs';
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
    ConfirmationDialogModule,
  ],
  providers: [ TradeFriendInventoryService, TradeService ],
  declarations: [ TradeFriendInventoryComponent ]
})
export class TradeFriendInventoryModule {}
