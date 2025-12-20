import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SelectUserDialogComponent } from './select-user-dialog.component';
import { UserListModule } from '../../components';

const MATERIAL_MODULES = [
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
];

@NgModule({
	imports: [
    UserListModule,

    ...MATERIAL_MODULES
  ],
	declarations: [ SelectUserDialogComponent ]
})
export class SelectUserDialogModule {}
