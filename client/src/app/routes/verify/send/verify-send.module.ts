import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { VerifySendComponent } from './verify-send.component';
import { VerifySendService } from './verify-send.service';

@NgModule({
	imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule
  ],
	declarations: [ VerifySendComponent ],
  providers: [ VerifySendService ],
	exports: [ VerifySendComponent ],
})
export class VerifySendModule {}
