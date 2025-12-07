import { NgModule } from '@angular/core';

import { LogoutComponent } from './logout.component';
import { AuthModule, HttpModule } from '../../../shared/services';

@NgModule({
	imports: [
		AuthModule,
		HttpModule,
	],
	declarations: [ LogoutComponent ],
})
export class LogoutModule {}
