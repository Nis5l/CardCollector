import { Component, Input, Output, EventEmitter } from '@angular/core';

import { RequestCardCardService } from './request-card-card.service';
import type { Card, Id } from '../../../../../../shared/types';
import { SubscriptionManagerComponent } from '../../../../../../shared/abstract';
import { LoadingService } from '../../../../../../shared/services';

@Component({
    selector: 'cc-request-card-card',
    templateUrl: './request-card-card.component.html',
    styleUrls: ['./request-card-card.component.scss'],
    standalone: false
})
export class RequestCardCardComponent extends SubscriptionManagerComponent {
	@Output()
	public readonly onRemove: EventEmitter<void> = new EventEmitter<void>();

	private _card: Card | null = null;
	@Input()
	public set card(card: Card) {
		this._card = card;
	}
	public get card(): Card {
		if(this._card == null) throw new Error("card not set");
		return this._card;
	}

	private _collectorId: Id | null = null;
	@Input()
	public set collectorId(id: Id) {
		this._collectorId = id;
	}
	public get collectorId(): Id {
		if(this._collectorId == null) throw new Error("collectorId not set");
		return this._collectorId;
	}

	constructor(
		private readonly loadingService: LoadingService,
		private readonly requestCardCardService: RequestCardCardService
	) {
		super();
	}

	public accept(): void {
		this.registerSubscription(this.loadingService.waitFor(this.requestCardCardService.accept(this.card.cardInfo.id)).subscribe({
			next: () => this.onRemove.next(),
			error: () => console.error("Error accepting Card Request")
		}));
	}

	public decline(): void {
		this.registerSubscription(this.loadingService.waitFor(this.requestCardCardService.decline(this.card.cardInfo.id)).subscribe({
			next: () => this.onRemove.next(),
			error: () => console.error("Error declining Card Request")
		}));
	}
}
