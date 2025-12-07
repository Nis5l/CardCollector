import { Injectable, Type } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { Popup, PopupLocation, PopupStyle } from './types';
import { PopupItem } from './popup-item.component';

@Injectable()
export class PopupService {
	private itemSubject: BehaviorSubject<PopupItem | null> = new BehaviorSubject<PopupItem | null>(null);

	public openPopup(component: Type<Popup>, location: PopupLocation){
		// TODO: Check that popup has enough space => if not move it so it can fit

		let style: PopupStyle = {
			top: location.y + "px",
			left: location.x + "px",
			width: location.width + "px",
			height: location.height + "px"
		};

		let item = new PopupItem(component, style);
		this.itemSubject.next(item);
	}

	public getObservable(): Observable<PopupItem | null>{
		return this.itemSubject.asObservable();
	}

}
