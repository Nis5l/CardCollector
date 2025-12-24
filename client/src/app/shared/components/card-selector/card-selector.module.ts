import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { CardSelectorComponent } from './card-selector.component';
import { NgVarModule } from '../../directives';
import { SelectCardDialogModule } from '../../dialogs';

const MATERIAL_MODULES = [
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatButtonModule,
  MatDialogModule
];

@NgModule({
	declarations: [ CardSelectorComponent ],
	imports: [
		CommonModule,

    ...MATERIAL_MODULES,

		NgVarModule,
		SelectCardDialogModule,
	],
	exports: [ CardSelectorComponent ],
})
export class CardSelectorModule {}
