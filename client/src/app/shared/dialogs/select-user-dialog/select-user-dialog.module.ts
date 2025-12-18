import { NgModule } from '@angular/core';

import { SelectUserDialogComponent } from './select-user-dialog.component';
import { UserListModule } from '../../components';

@NgModule({
	imports: [
    UserListModule,
  ],
	declarations: [ SelectUserDialogComponent ]
})
export class SelectUserDialogModule {}
