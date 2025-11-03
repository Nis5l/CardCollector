import { Component, ViewChild, HostListener } from '@angular/core';

import { Popup, PopupStyle } from '../types';
import { PopupDirective } from '../popup.directive';
import { PopupItem } from '../popup-item.component';
import { PopupService } from '../popup.service';

import { SubscriptionManagerComponent } from '../../../abstract';

@Component({
    selector: "cc-popup-container",
    templateUrl: "./popup-container.component.html",
    styleUrls: ["./popup-container.component.scss"],
    standalone: false
})
export class PopupContainerComponent extends SubscriptionManagerComponent {
	private popupItem: PopupItem | null = null;

	@ViewChild(PopupDirective) popupHost!: PopupDirective;

	private popupInstance: Popup | null = null;

	constructor(
		private popupService: PopupService
	) {
		super();
		this.registerSubscription(
			this.popupService.getObservable().subscribe((item: PopupItem | null) => {
				this.closePopup();
				this.popupItem = item;
				this.openPopup();
			})
		);
	}

	private closePopup(){
		if(this.popupHost == null) return;
		const viewContainerRef = this.popupHost.viewContainerRef;
		// Call onClose so that Popup can clean up if needed
		if(this.popupInstance != null) this.popupInstance.onClose();
		viewContainerRef.clear();

		this.popupInstance = null;
		this.popupItem = null;
	}

	private openPopup(){
		if(this.popupItem == null) return;
		const viewContainerRef = this.popupHost.viewContainerRef;
		const componentRef = viewContainerRef.createComponent<Popup>(this.popupItem.component);
		this.popupInstance = componentRef.instance;

		//Call onOpen so that Popup can initialize stuff if needed
		this.popupInstance.onOpen();
		this.clickInside = true;
	}

	public hasPopup(): boolean{
		return this.popupItem != null;
	}

	public getStyle(): PopupStyle{
		if(this.popupItem == null) return { top: "0px", left: "0px", width: "100px", height: "100px" };
		return this.popupItem.style;
	}

	public onResize(e: UIEvent){
		this.closePopup();
	}

	private clickInside: boolean = false;

	public onClick(){
		if(this.popupInstance == null) return;
		this.clickInside = true;
	}

	@HostListener('document:click', ['$event'])
	clickout(event: any) {
		if(this.popupInstance == null) return;

		if(!this.clickInside){
			this.closePopup();
		}

		this.clickInside = false;
	}
}
