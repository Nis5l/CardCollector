import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NgVarModule } from '../../../../shared/directives';

import { CollectorOpenModule } from '../../shared';
import { UserModule } from '../../../../shared/services';
import { CollectorDashboardComponent } from './collector-dashboard.component';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

		NgVarModule,

    ...MATERIAL_MODULES,

		CollectorOpenModule,
    UserModule,
	],
	declarations: [ CollectorDashboardComponent ],
  exports: [ CollectorDashboardComponent ]
})
export class CollectorDashboardModule {}
