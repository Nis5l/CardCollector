import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SidebarComponent } from './sidebar.component';
import { NgVarModule } from '../../shared/directives';

const MATERIAL_MODULES = [
	MatSidenavModule,
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,

		...MATERIAL_MODULES,

    NgVarModule
	],
	declarations: [ SidebarComponent ],
	exports: [ SidebarComponent ],
})
export class SideBarModule {}
