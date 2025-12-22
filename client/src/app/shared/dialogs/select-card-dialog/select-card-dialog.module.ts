import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SelectCardDialogComponent } from './select-card-dialog.component';
import { CardListModule } from '../../components';

const MATERIAL_MODULES = [
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
];

@NgModule({
	imports: [
    CardListModule,

    ...MATERIAL_MODULES
  ],
	declarations: [ SelectCardDialogComponent ]
})
export class SelectCardDialogModule {}
