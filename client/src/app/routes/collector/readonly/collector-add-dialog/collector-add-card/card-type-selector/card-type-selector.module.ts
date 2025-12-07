import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { HttpModule } from '../../../../../../shared/services';
import { CardTypeSelectorComponent } from './card-type-selector.component';
import { CardTypeSelectorService } from './card-type-selector.service';

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

		HttpModule,
	],
	providers: [ CardTypeSelectorService ],
	declarations: [ CardTypeSelectorComponent ],
	exports: [ CardTypeSelectorComponent ]
})
export class CardTypeSelectorModule {}
