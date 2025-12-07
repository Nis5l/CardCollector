import { NgModule } from '@angular/core';

import { PopupDirective } from './popup.directive';
import { PopupContainerComponent } from './popup-container';
import { PopupService } from './popup.service';

@NgModule({
	providers: [ PopupService ],
	declarations: [ PopupContainerComponent, PopupDirective ],
	exports: [ PopupContainerComponent ],

})
export class PopupModule {}
