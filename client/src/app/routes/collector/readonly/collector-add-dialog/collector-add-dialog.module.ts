import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { CollectorAddCardModule } from './collector-add-card';
import { CollectorUpdateCardModule } from './collector-update-card';
import { CollectorAddCardTypeModule } from './collector-add-card-type';
import { CollectorAddDialogComponent } from './collector-add-dialog.component';
import { CollectorUpdateCardTypeModule } from './collector-update-card-type';
import { CollectorDeleteCardTypeModule } from './collector-delete-card-type';
import { CollectorDeleteCardModule } from './collector-delete-card';

const MATERIAL_MODULES = [
	MatTabsModule,
  MatIconModule,
  MatButtonModule,
  MatToolbarModule
];

@NgModule({
	imports: [
    CommonModule,

		CollectorAddCardModule,
    CollectorUpdateCardModule,
    CollectorDeleteCardModule,
		CollectorAddCardTypeModule,
    CollectorUpdateCardTypeModule,
    CollectorDeleteCardTypeModule,

		...MATERIAL_MODULES,
	],
	declarations: [ CollectorAddDialogComponent ],
})
export class CollectorAddDialogModule {}
