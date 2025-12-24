import { Component, Injector, Input, forwardRef, AfterViewInit } from '@angular/core';
import { Observable,  BehaviorSubject, filter } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, FormControl } from '@angular/forms';

import type { Id, Card } from '../../types';
import { CardState } from '../../types';
import { SubscriptionManagerComponent } from '../../abstract';
import { SelectCardDialogComponent } from '../../dialogs';

@Component({
    selector: 'cc-card-selector',
    templateUrl: './card-selector.component.html',
    styleUrls: ['./card-selector.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => CardSelectorComponent)
        }
    ],
    standalone: false
})
export class CardSelectorComponent extends SubscriptionManagerComponent implements ControlValueAccessor, AfterViewInit {
  public readonly collectorId$: Observable<Id>;
  private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
  @Input()
  public set collectorId(userId: Id | null) {
    this.collectorIdSubject.next(userId);
  }
  public get collectorId(): Id {
    const collectorId = this.collectorIdSubject.getValue();
    if(collectorId == null) throw new Error("collectorId not set");
    return collectorId;
  }

  private readonly cardSubject: BehaviorSubject<Card | null> = new BehaviorSubject<Card | null>(null);
  public readonly card$: Observable<Card | null>;

	public formControl: FormControl | null = null;

	private onChange = (card: Card | null) => {};
	private onTouched = () => {};
	private touched: boolean = false;
	public disabled: boolean = false;

  constructor(
    private injector: Injector,
    private readonly matDialog: MatDialog,
  ) {
    super();

    this.collectorId$ = this.collectorIdSubject.pipe(
      filter((collectorId): collectorId is Id => collectorId != null)
    );

    this.card$ = this.cardSubject.asObservable();

    this.registerSubscription(this.card$.subscribe(
      card => {
        this.onChange(card);
        this.onTouched();
      }
    ));
  }

  public clearSelection(): void {
    if (this.disabled) return;

    this.cardSubject.next(null);
  }

  public selectCard(collectorId: Id) {
    if (this.disabled) return;

    this.registerSubscription(SelectCardDialogComponent.open(this.matDialog, { collectorId, title: "Select Card", cardState: CardState.Created }).subscribe(
      card => this.cardSubject.next(card ?? null))
    );
  }

	ngAfterViewInit(): void {
		const ngControl: NgControl | null = this.injector.get(NgControl, null);
		if (ngControl) {
			this.formControl = ngControl.control as FormControl;
		}
	}

	writeValue(card: Card | null) {
		this.cardSubject.next(card);
	}

	registerOnChange(onChange: any) {
		this.onChange = onChange;
	}

	registerOnTouched(onTouched: any) {
		this.onTouched = onTouched;
	}

	markAsTouched() {
		if (!this.touched) {
		  this.onTouched();
		  this.touched = true;
		}
	}

	setDisabledState(disabled: boolean) {
		this.disabled = disabled;
    this.formControl?.[disabled ? 'disable' : 'enable']({ emitEvent: false });
	}
}
