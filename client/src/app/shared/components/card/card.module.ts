import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HttpModule } from '../../services';
import { NgVarModule } from '../../directives';
import { CardComponent } from './card.component';
import { CardService } from './card.service';

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
    RouterModule,

		NgVarModule,
	],
	providers: [ CardService ],
	declarations: [ CardComponent ],
	exports: [ CardComponent ],
})
export class CardModule {}
