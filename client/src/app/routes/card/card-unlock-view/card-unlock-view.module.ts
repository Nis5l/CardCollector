import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CardModule } from '../../../shared/components';
import { NgVarModule } from '../../../shared/directives';
import { CardUnlockViewComponent } from './card-unlock-view.component';

@NgModule({
	imports: [
		CommonModule,

		NgVarModule,
		CardModule,
		RouterModule
	],
	declarations: [ CardUnlockViewComponent ],
	exports: [ CardUnlockViewComponent ],
})
export class CardUnlockViewModule {}
