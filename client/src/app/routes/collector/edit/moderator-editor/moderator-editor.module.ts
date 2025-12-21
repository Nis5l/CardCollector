import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ModeratorEditorComponent } from './moderator-editor.component';
import { ModeratorEditorService } from './moderator-editor.service';
import { HttpModule, UserModule, AuthModule } from '../../../../shared/services';
import { UserCardModule, LoadingModule } from '../../../../shared/components';
import { SelectUserDialogModule, YesNoCancelDialogModule } from '../../../../shared/dialogs';
import { CollectorServiceModule } from '../../shared';

const MATERIAL_MODULES = [
  MatIconModule,
  MatButtonModule,
];

@NgModule({
  imports: [
    CommonModule,
    HttpModule,

    ...MATERIAL_MODULES,

    UserModule,
    UserCardModule,
    LoadingModule,
    YesNoCancelDialogModule,
    SelectUserDialogModule,
    AuthModule,
    CollectorServiceModule,
  ],
  providers: [ ModeratorEditorService ],
  declarations: [ ModeratorEditorComponent ],
  exports: [ ModeratorEditorComponent ]
})
export class ModeratorEditorModule {}
