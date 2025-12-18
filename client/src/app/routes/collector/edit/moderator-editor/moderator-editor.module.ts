import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ModeratorEditorComponent } from './moderator-editor.component';
import { ModeratorEditorService } from './moderator-editor.service';
import { HttpModule, UserModule } from '../../../../shared/services';
import { UserCardModule, LoadingModule } from '../../../../shared/components';
import { CollectorService } from '../../collector.service';

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
  ],
  providers: [ ModeratorEditorService, CollectorService ],
  declarations: [ ModeratorEditorComponent ],
  exports: [ ModeratorEditorComponent ]
})
export class ModeratorEditorModule {}
