import { Component, Input, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, tap, filter } from 'rxjs';

import { SubscriptionManagerComponent } from '../../abstract';

@Component({
    selector: 'cc-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
    standalone: false
})
export class LoadingComponent<T> extends SubscriptionManagerComponent implements OnInit {
	private readonly observableSubject: BehaviorSubject<Observable<T> | null> = new BehaviorSubject<Observable<T> | null>(null);
	private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public readonly loading$: Observable<boolean>;
	@Input()
	public set observable(o: Observable<T>) {
		this.observableSubject.next(o);
	}
	public get observable(): Observable<T> {
		const o = this.observableSubject.getValue();
		if(o == null) throw new Error("observable not set");
		return o;
	}
  @Input()
  public boolObservable: boolean = false;

	public constructor() {
		super();
		this.loading$ = this.loadingSubject.asObservable();
	}

  public ngOnInit(): void {
		this.registerSubscription(this.observableSubject.pipe(
			filter((obs): obs is Observable<T> => obs != null)
		).subscribe(obs => {
			if(this.boolObservable === true) this.registerSubscription(obs.subscribe(b => this.loadingSubject.next(b === true)));
      else this.waitFor(obs);
		}));
  }

	//NOTE: this observable should be shared!!
	public waitFor(o: Observable<T>): void {
		const f = () => {
			this.loadingSubject.next(false);
		};
		this.registerSubscription(o.pipe(tap({
			next: () => f(),
			error: () => f(),
			subscribe:() => {
				this.loadingSubject.next(true);
			},
			finalize: () => undefined,
			complete: () => undefined
		})).subscribe());
	}
}
