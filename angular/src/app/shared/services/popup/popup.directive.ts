import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[popupHost]',
    standalone: false
})
export class PopupDirective {
	constructor(public viewContainerRef: ViewContainerRef){}
}
