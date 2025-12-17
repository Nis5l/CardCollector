import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { VerifyCheckComponent } from './verify-check.component';
import { VerifyCheckService } from './verify-check.service';
import { NgVarModule } from '../../../shared/directives';

const MATERIAL_MODULES = [
  MatIconModule
];

@NgModule({
	imports: [
    CommonModule,

    ...MATERIAL_MODULES,

    NgVarModule,
  ],
	declarations: [ VerifyCheckComponent ],
  providers: [ VerifyCheckService ],
	exports: [ VerifyCheckComponent ],
})
export class VerifyCheckModule {}
