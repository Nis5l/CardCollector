import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { HeaderComponent } from './header.component';
import { SideBarModule } from './sidebar';
import { NotificationsModule } from './notifications';
import { AuthModule, UserModule } from '../shared/services';
import { NgVarModule } from '../shared/directives';

const MATERIAL_MODULES = [
	MatToolbarModule,
	MatIconModule,
	MatButtonModule,
	MatTooltipModule,
	MatMenuModule,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		...MATERIAL_MODULES,

		NgVarModule,
		SideBarModule,
		NotificationsModule,
		AuthModule,
		UserModule,
	],
	declarations: [ HeaderComponent ],
	exports: [ HeaderComponent ],
})
export class HeaderModule {}
