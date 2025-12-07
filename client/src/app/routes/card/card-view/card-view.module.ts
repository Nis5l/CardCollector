import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CardModule } from '../../../shared/components';
import { NgVarModule } from '../../../shared/directives';
import { CardViewComponent } from './card-view.component';

@NgModule({
	imports: [
		CommonModule,

		NgVarModule,
		CardModule,
		RouterModule
	],
	declarations: [ CardViewComponent ],
	exports: [ CardViewComponent ],
})
export class CardViewModule {}
