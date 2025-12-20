import { Component, Input } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject, filter, map, combineLatest as observableCombineLatest, merge as observableMerge } from 'rxjs';

import { CollectorImageService } from './collector-image.service';
import type { CollectorImage } from './types';
import { AuthService, LoadingService } from '../../../../shared/services';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';

@Component({
    selector: "cc-collector-image",
    templateUrl: "./collector-image.component.html",
    styleUrls: ["./collector-image.component.scss"],
    standalone: false
})
export class CollectorImageComponent extends SubscriptionManagerComponent {
	private readonly collectorImageSubject: BehaviorSubject<CollectorImage | null> = new BehaviorSubject<CollectorImage | null>(null);
	private readonly collectorImageUrlSubject: ReplaySubject<string> = new ReplaySubject<string>(1);
	public readonly collectorImage$: Observable<string>;
	public readonly editableSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public readonly editable$: Observable<boolean>;

	@Input()
	public set collector(collectorImage: CollectorImage) {
		this.collectorImageSubject.next(collectorImage);
	}
	public get collector(): CollectorImage {
		const collectorImage = this.collectorImageSubject.getValue();
		if(collectorImage == null) throw new Error("collectorImage not set");
		return collectorImage;
	}

	@Input()
	public set editable(b: boolean) {
		this.editableSubject.next(b);
	}

	public get editable(): boolean {
		return this.editableSubject.getValue();
	}

	constructor(
		private readonly collectorImageService: CollectorImageService,
		private readonly authService: AuthService,
		private readonly loadingService: LoadingService
	) {
		super();
		const collectorImageNonNull$ = this.collectorImageSubject.asObservable().pipe(
			filter((collectorImage): collectorImage is CollectorImage => collectorImage != null),
		);
		this.collectorImage$ = observableMerge(collectorImageNonNull$, this.collectorImageUrlSubject.asObservable()).pipe(
			map(collectorImage => typeof collectorImage === "string" ? collectorImage : this.collectorImageService.getImageUrl(collectorImage.id)),
		);

		this.editable$ = this.editableSubject.asObservable()
  }

	public uploadImage(file: File) {
		this.registerSubscription(
			this.loadingService.waitFor(this.collectorImageService.uploadImage(this.collector.id, file)).subscribe(
				() => this.collectorImageUrlSubject.next(`${this.collectorImageService.getImageUrl(this.collector.id)}?${new Date().getTime()}`)
			)
		);
	}
}
