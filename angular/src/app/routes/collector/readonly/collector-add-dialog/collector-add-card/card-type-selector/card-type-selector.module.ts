import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';

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
