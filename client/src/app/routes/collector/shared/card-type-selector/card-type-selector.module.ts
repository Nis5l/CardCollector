import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { HttpModule, CardServiceModule } from '../../../../shared/services';
import { CardTypeSelectorComponent } from './card-type-selector.component';

const MATERIAL_MODULES = [
	MatInputModule,
	MatFormFieldModule,
	MatAutocompleteModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,

		...MATERIAL_MODULES,

    CardServiceModule,
		HttpModule,
	],
	providers: [ ],
	declarations: [ CardTypeSelectorComponent ],
	exports: [ CardTypeSelectorComponent ]
})
export class CardTypeSelectorModule {}
