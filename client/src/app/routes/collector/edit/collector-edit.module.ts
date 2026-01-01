import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

import { CollectorEditComponent } from './collector-edit.component';
import { CollectorServiceModule } from '../shared';
import { HttpModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import {
	CollectorImageModule,
	CollectorFavoriteModule,
	CollectorBannerModule,
	CollectorOpenModule
} from '../shared';
import { ModeratorEditorModule } from './moderator-editor';
import { SettingsEditorModule } from './settings-editor';

const MATERIAL_MODULES = [
  MatFormFieldModule,
  MatInputModule,
	MatButtonModule,
	MatIconModule,
  MatCardModule,
];

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		RouterModule,
    ReactiveFormsModule,

		...MATERIAL_MODULES,

		NgVarModule,
    CollectorServiceModule,

		CollectorImageModule,
		CollectorFavoriteModule,
		CollectorBannerModule,
		CollectorOpenModule,

    ModeratorEditorModule,
    SettingsEditorModule,
	],
	providers: [ ],
	declarations: [ CollectorEditComponent ],
})
export class CollectorEditModule {}
