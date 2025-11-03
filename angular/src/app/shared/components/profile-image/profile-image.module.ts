import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { HttpModule, AuthModule, LoadingModule } from '../../services';
import { ImageCircleModule } from '../image-circle';
import { ProfileImageComponent } from './profile-image.component';
import { ProfileImageService } from './profile-image.service';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		AuthModule,
		LoadingModule,
		ImageCircleModule,
		HttpModule,
	],
	providers: [ ProfileImageService ],
	declarations: [ ProfileImageComponent ],
	exports: [ ProfileImageComponent ],
})
export class ProfileImageModule {}
