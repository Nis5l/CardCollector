import { NgModule } from '@angular/core';

import { HttpModule } from '../../../../shared/services';

import { CollectorService } from './collector.service';

@NgModule({
imports: [
	HttpModule,
],
providers: [ CollectorService ],
})
export class CollectorServiceModule {}
