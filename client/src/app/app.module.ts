import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderModule } from './header';
import { LoadingModule, PopupModule } from './shared/services';
import {
	LoginModule,
	LogoutModule,
	CollectorsModule,
	RegisterModule,
	ProfileReadonlyModule,
	ProfileEditModule,
	HomeModule,
	CollectorReadonlyModule,
	CollectorEditModule,
	CardViewModule,
  CardUpgradeModule,
  UsersModule,
  ProfileReadonlyTradeModule,
  VerifyModule,
} from './routes';

const MODULES = [
	HeaderModule,
	LoadingModule,

	LoginModule,
	LogoutModule,
	RegisterModule,
  VerifyModule,

	CollectorsModule,
	CollectorReadonlyModule,
	CollectorEditModule,
	ProfileReadonlyModule,
	ProfileEditModule,
	HomeModule,
	PopupModule,
	CardViewModule,
  CardUpgradeModule,
  UsersModule,
  ProfileReadonlyTradeModule,
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,

    ...MODULES
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    [
      'person',
      'person_add',
      'person_add_disabled',
      'person_remove',
      'star',
      'group',
      'featured_play_list',
      'remove',
      'edit',
      'notifications',
      'compare_arrows',
      'menu',
      'login',
      'logout',
      'close',
      'check',
      'hourglass_empty',
      'star_outline',
      'more_vert',
      'add',
      'add_a_photo',
      'list_alt',
      'home',
      'backpack',
      'arrow_upward',
      'arrow_downward',
    ].forEach(icon => {
      iconRegistry.addSvgIcon(
        icon,
        sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`)
      );
    })
  }
}
