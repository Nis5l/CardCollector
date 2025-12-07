import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HttpModule } from '../http-service';
import { AuthModule  } from '../auth-service';
import { UserService } from './user.service';

@NgModule({
	imports: [
		RouterModule,

		HttpModule,
		AuthModule
	],
	providers: [ UserService ]
})
export class UserModule {}
