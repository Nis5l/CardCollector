import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CardServiceModule } from '../../services';
import { NgVarModule } from '../../directives';
import { CardComponent } from './card.component';

@NgModule({
	imports: [
		CommonModule,
    RouterModule,

    CardServiceModule,
		NgVarModule,
	],
	providers: [ ],
	declarations: [ CardComponent ],
	exports: [ CardComponent ],
})
export class CardModule {}
