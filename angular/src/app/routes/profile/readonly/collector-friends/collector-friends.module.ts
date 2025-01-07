import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HttpModule, AuthModule } from '../../../../shared/services';
import { CollectorFriendsComponent } from './collector-friends.component';
import { CollectorFriendsService } from './collector-friends.service';
import { NgVarModule } from '../../../../shared/directives';
import { CollectorFriendCardModule } from './collector-friend-card';
import { ProfileService } from '../../profile.service';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,

    CollectorFriendCardModule,

    HttpModule,
    NgVarModule,
    AuthModule,
  ],
  providers: [ CollectorFriendsService, ProfileService ],
  declarations: [ CollectorFriendsComponent ],
  exports: [ CollectorFriendsComponent ],
})
export class CollectorFriendsModule { }
