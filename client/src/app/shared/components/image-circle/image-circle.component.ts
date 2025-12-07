import { Component, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, ReplaySubject } from 'rxjs';

import { eventGetImage } from '../../../shared/utils';

@Component({
    selector: "cc-image-circle",
    templateUrl: "./image-circle.component.html",
    styleUrls: ["./image-circle.component.scss"],
    standalone: false
})
export class ImageCircleComponent {
	private readonly imageSubject: ReplaySubject<string | SafeResourceUrl> = new ReplaySubject<string | SafeResourceUrl>(1);
	public readonly image$: Observable<string | SafeResourceUrl>;

	private _imageInput: ElementRef | null = null;
	@ViewChild('imageInput', { read: ElementRef })
	public set imageInput(e: ElementRef) {
		this._imageInput = e;
	}

	public get imageInput(): ElementRef {
		if(!this._imageInput) throw new Error("no imageInput set");
		return this._imageInput;
	}

	@Output()
	public readonly onImageChange: EventEmitter<File> = new EventEmitter<File>();

	@Input()
	public set image(path: string | null) {
		if(path == null) return;
		this.imageSubject.next(path);
	}

	public _editable: boolean = false;
	@Input()
	public set editable(v: boolean | null) {
		this._editable = v === true;
	}

	public get editable(): boolean {
		return this._editable;
	}

	constructor(private readonly domSanitizer: DomSanitizer) {
		this.image$ = this.imageSubject.asObservable();
	}

	public imageChange(target: EventTarget | null): void {
		const file = eventGetImage(target);

		this.onImageChange.next(file);
		const blobUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
		this.imageSubject.next(blobUrl);
	}

	public selectImage(): void {
		if(!this.editable) return;
		this.imageInput.nativeElement.click();
	}
}
