import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { HttpModule, AuthModule } from '../../../../../../shared/services';
import { InventoryModule } from '../../../../../../shared/components/inventory';
import { ConfirmationDialogModule } from '../../../../../../shared/dialogs';
import { TradeSelfInventoryComponent } from './trade-self-inventory.component';
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
  providers: [ TradeService ],
  declarations: [ TradeSelfInventoryComponent ]
})
export class TradeSelfInventoryModule {}
