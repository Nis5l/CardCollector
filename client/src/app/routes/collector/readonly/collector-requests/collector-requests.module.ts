import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgVarModule } from '../../../../shared/directives';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { RequestCardCardTypeModule } from './request-cards';
import { RequestCardCardModule } from './request-cards';
import { CollectorRequestsComponent } from './collector-requests.component';
import { CollectorService } from '../../shared';
import { CardServiceModule } from '../../../../shared/services';
import { LoadingModule } from '../../../../shared/components';

const MATERIAL_MODULES = [
  MatIconModule,
  MatButtonModule,
  MatPaginatorModule,
  MatSelectModule,
];

@NgModule({
	imports: [
    CommonModule,
    ReactiveFormsModule,

    ...MATERIAL_MODULES,

    LoadingModule,
    NgVarModule,
    RequestCardCardTypeModule,
    RequestCardCardModule,
    CardServiceModule,
  ],
  providers: [ CollectorService ],
	declarations: [ CollectorRequestsComponent ],
  exports: [ CollectorRequestsComponent ]
})
export class CollectorRequestsModule {}
