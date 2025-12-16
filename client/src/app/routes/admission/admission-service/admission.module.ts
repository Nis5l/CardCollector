import { NgModule } from '@angular/core';

import { AdmissionService } from './admission.service';
import { HttpModule } from '../../../shared/services';

@NgModule({
  imports: [ HttpModule ],
	providers: [ AdmissionService ],
})
export class AdmissionModule {}
