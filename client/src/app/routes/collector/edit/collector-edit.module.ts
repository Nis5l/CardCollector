import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


import { CollectorEditComponent } from './collector-edit.component';
import { CollectorService } from '../collector.service';
import { HttpModule, AuthModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import {
	CollectorImageModule,
	CollectorFavoriteModule,
	CollectorBannerModule,
	CollectorOpenModule
} from '../shared';

const MATERIAL_MODULES = [
  MatFormFieldModule,
  MatInputModule,
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		RouterModule,
    ReactiveFormsModule,

		...MATERIAL_MODULES,

		AuthModule,
		NgVarModule,

		CollectorImageModule,
		CollectorFavoriteModule,
		CollectorBannerModule,
		CollectorOpenModule,
	],
	providers: [ CollectorService ],
	declarations: [ CollectorEditComponent ],
})
export class CollectorEditModule {}
