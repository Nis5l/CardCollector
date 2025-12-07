import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import type { Collector, Id } from '../../types';

@Component({
    selector: 'cc-collector-card',
    templateUrl: './collector-card.component.html',
    styleUrls: ['./collector-card.component.scss'],
    standalone: false
})
export class CollectorCardComponent {
	private _collector: Collector | null = null;

  @Input()
  public tradeId: null | Id = null;

	@Input()
	public set collector(collector: Collector) {
		this._collector = collector;
	}
	public get collector(): Collector {
		if(this._collector == null) throw new Error("Collector not set");
		return this._collector;
	}

	constructor(private readonly router: Router) {}

	public collectorClick(): void {
		this.router.navigate(["collector", this.collector.id]);
	}

	public tradeClick(): void {
    if(this.tradeId == null) throw new Error("tradeId should be set here");
		this.router.navigate(["user", this.tradeId, "trade", this.collector.id]);
	}
}
