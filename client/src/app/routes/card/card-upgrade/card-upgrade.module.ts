import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';

import { CardUpgradeComponent } from './card-upgrade.component';
import { CardUpgradeService } from './card-upgrade.service';
import { HttpModule } from '../../../shared/services';
import { CardModule, LoadingModule } from '../../../shared/components';
import { NgVarModule } from '../../../shared/directives';
import { YesNoCancelDialogModule } from '../../../shared/dialogs';

const MATERIAL_MODULES = [
  MatPaginatorModule,
  MatDividerModule,
  MatDialogModule,
];

@NgModule({
  declarations: [ CardUpgradeComponent ],
  providers: [ CardUpgradeService ],
  imports: [
    CommonModule,
    RouterModule,

    ...MATERIAL_MODULES,

    NgVarModule,
    HttpModule,
    CardModule,
    YesNoCancelDialogModule,
    LoadingModule,
  ]
})
export class CardUpgradeModule {}
