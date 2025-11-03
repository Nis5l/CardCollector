import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgVarModule } from '../../../../shared/directives';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';

import { RequestCardCardTypeModule } from './request-cards';
import { RequestCardCardModule } from './request-cards';
import { CollectorRequestsComponent } from './collector-requests.component';
import { CollectorRequestsService } from './collector-requests.service';
import { LoadingModule } from '../../../../shared/components';

const MATERIAL_MODULES = [
  MatIconModule,
  MatButtonModule,
  MatPaginatorModule,
];

@NgModule({
	imports: [
    CommonModule,

    ...MATERIAL_MODULES,

	LoadingModule,
    NgVarModule,
    RequestCardCardTypeModule,
	RequestCardCardModule,
  ],
  providers: [ CollectorRequestsService ],
	declarations: [ CollectorRequestsComponent ],
  exports: [ CollectorRequestsComponent ]
})
export class CollectorRequestsModule {}
