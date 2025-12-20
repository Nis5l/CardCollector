import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { CardModule, LoadingModule } from '../../../shared/components';
import { NgVarModule } from '../../../shared/directives';
import { CardUnlockViewComponent } from './card-unlock-view.component';

const MATERIAL_MODULES = [
  MatIconModule
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,

    ...MATERIAL_MODULES,

		NgVarModule,
		CardModule,
    LoadingModule,
	],
	declarations: [ CardUnlockViewComponent ],
	exports: [ CardUnlockViewComponent ],
})
export class CardUnlockViewModule {}
