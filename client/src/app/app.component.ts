import { Component } from '@angular/core';

import { NavigationService } from './shared/services';

@Component({
    selector: 'cc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
	title = 'CardCollector';

  //NOTE: keep, so navigation is tracked on every page
  constructor(private readonly navigationService: NavigationService) {}
}
