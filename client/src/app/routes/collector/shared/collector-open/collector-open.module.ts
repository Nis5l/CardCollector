import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HttpModule } from '../../../../shared/services';

import { CollectorOpenService } from './collector-open.service';
import { CollectorOpenComponent } from './collector-open.component';

@NgModule({
imports: [
	CommonModule,
	RouterModule,

	HttpModule,
],
providers: [ CollectorOpenService ],
declarations: [ CollectorOpenComponent ],
exports: [ CollectorOpenComponent ]
})
export class CollectorOpenModule {}
