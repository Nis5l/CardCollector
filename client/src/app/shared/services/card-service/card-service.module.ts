import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HttpModule } from '../http-service';
import { AuthModule  } from '../auth-service';
import { CardService } from './card.service';

@NgModule({
	imports: [
		RouterModule,

		HttpModule,
		AuthModule
	],
	providers: [ CardService ]
})
export class CardServiceModule {}
