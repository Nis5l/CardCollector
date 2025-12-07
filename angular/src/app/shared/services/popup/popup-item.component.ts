import { Type } from '@angular/core';

import { Popup, PopupStyle } from './types';

export class PopupItem{
	constructor(public component: Type<Popup>, public style: PopupStyle){}
}
