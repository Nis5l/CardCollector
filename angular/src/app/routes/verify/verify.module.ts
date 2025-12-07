import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { VerifyComponent } from './verify.component';
import { VerifyService } from './verify.service';

@NgModule({
	imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule
  ],
	declarations: [ VerifyComponent ],
  providers: [ VerifyService ],
	exports: [ VerifyComponent ],
})
export class VerifyModule {}
