import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { TabNavigationComponent } from './tab-navigation.component';

@NgModule({
	imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
  ],
	declarations: [ TabNavigationComponent ],
  exports: [ TabNavigationComponent ]
})
export class TabNavigationModule {}
