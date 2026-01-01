import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { SettingsEditorComponent } from './settings-editor.component';
import { SettingsEditorService } from './settings-editor.service';
import { HttpModule } from '../../../../shared/services';
import { LoadingModule } from '../../../../shared/components';

const MATERIAL_MODULES = [
  MatIconModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
];

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HttpModule,

    ...MATERIAL_MODULES,

    LoadingModule,
  ],
  providers: [ SettingsEditorService ],
  declarations: [ SettingsEditorComponent ],
  exports: [ SettingsEditorComponent ]
})
export class SettingsEditorModule {}
