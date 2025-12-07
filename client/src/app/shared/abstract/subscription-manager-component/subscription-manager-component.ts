import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
export class SubscriptionManagerComponent implements OnDestroy{
	private subscriptions: Subscription[] = [];

	protected registerSubscription(subscription: Subscription){
		this.subscriptions.push(subscription);
	}

	protected unsubscribeSubscriptions(){
		this.subscriptions.forEach(s => s.unsubscribe());
		this.subscriptions.length = 0;
	}

	ngOnDestroy(): void{
		this.unsubscribeSubscriptions();
	}
}
