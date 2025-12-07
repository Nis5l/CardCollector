import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserComponent } from './user.component';
import { UserModule as UserServiceModule } from '../../services';
import { NgVarModule } from '../../directives';
import { ProfileImageModule } from '../profile-image';

@NgModule({
	declarations: [ UserComponent ],
	imports: [ 
		CommonModule,

		NgVarModule,
		UserServiceModule,
		ProfileImageModule,
	],
	exports: [ UserComponent ],
})
export class UserModule {}
