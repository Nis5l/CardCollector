import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Observable,  BehaviorSubject, timer, filter, map, combineLatest } from 'rxjs';
import type { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

import type { UnlockedCard, Card } from '../../types';
import { SubscriptionManagerComponent } from '../../abstract';
import { CardService } from '../../services';

function isCard(card: UnlockedCard | Card): card is Card {
	return !("id" in card);
}

@Component({
    selector: 'cc-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    standalone: false
})
export class CardComponent extends SubscriptionManagerComponent {
	private readonly cardSubject: BehaviorSubject<UnlockedCard | Card | null> = new BehaviorSubject<UnlockedCard | Card | null>(null);
	public readonly card$: Observable<UnlockedCard | Card>;
  @Output()
  public readonly clickEvent: EventEmitter<void> = new EventEmitter<void>();

	@Input()
	public set card(card: UnlockedCard | Card | null) {
    if(card == null) return;
		this.cardSubject.next(card);
	}
	public get card(): UnlockedCard | Card | null {
    const card = this.cardSubject.getValue();
    if(card == null) throw new Error("card is null");
		return card;
	}

	public readonly cardImageSubject: BehaviorSubject<string | SafeResourceUrl | null> = new BehaviorSubject<string | SafeResourceUrl | null>(null);
	@Input()
  public set cardImage(image: string | SafeResourceUrl | null) {
    this.cardImageSubject.next(image);
  }
  public get cardImage(): string | SafeResourceUrl | null {
    return this.cardImageSubject.getValue();
  }

  @Input()
  public click: "none" | "upgrade" | "event" | "navigate" = "none";

  @Input()
  public suggestion: boolean = false;

  @Input()
  public turn: boolean = false;
  private turning: boolean = false;

	public readonly name$: Observable<string>;
	public readonly type$: Observable<string>;
	public readonly image$: Observable<string | SafeResourceUrl>;
	public readonly frameFront$: Observable<string>;
	public readonly frameBack$: Observable<string>;
	public readonly level$: Observable<string>;
	public readonly quality$: Observable<string>;
	public readonly effectImage$: Observable<string>;

	constructor(
    private readonly cardService: CardService,
    private readonly router: Router,
  ) {
    super();
		this.card$ = this.cardSubject.asObservable().pipe(
      filter((card): card is Card | UnlockedCard => card != null)
    );

    this.name$ = this.card$.pipe(
      map(card => (isCard(card) ? card : card.card).cardInfo.name)
    );

    this.type$ = this.card$.pipe(
      map(card => (isCard(card) ? card : card.card).cardType.name)
    );

    this.frameFront$ = this.card$.pipe(
      map(card => (isCard(card) || card.cardFrame == null) ? this.cardService.getDefaultCardFrameFront() : this.cardService.getCardFrameFront(card.cardFrame.id))
    );

    this.frameBack$ = this.card$.pipe(
      map(card => (isCard(card) || card.cardFrame == null) ? this.cardService.getDefaultCardFrameBack() : this.cardService.getCardFrameBack(card.cardFrame.id))
    );

    this.image$ = combineLatest([this.card$, this.cardImageSubject.asObservable()]).pipe(
      map(([card, cardImage]) => cardImage ?? this.cardService.getCardImage((isCard(card) ? card : card.card).cardInfo.id))
    );

    this.level$ = this.card$.pipe(
      filter((card): card is UnlockedCard => !isCard(card)),
      map(card => card.level.toString())
    );

    this.quality$ = this.card$.pipe(
      filter((card): card is UnlockedCard => !isCard(card)),
      map(card => card.quality.toString())
    );

    this.effectImage$ = this.card$.pipe(
      filter((card): card is UnlockedCard => !isCard(card)),
      map(card => card.cardEffect?.image),
      filter(image => image != null),
    );
	}

  public onClick(card: Card | UnlockedCard | null): void {
    if(this.turning === true) return;
    if(this.turn) {
      this.turn = false;
      this.turning = true;
      this.registerSubscription(timer(1000).subscribe(() => this.turning = false));
    }

    switch(this.click) {
      case "none": {
      } break;
      case "navigate": {
        if(card == null) throw new Error("card is not UnlockedCard");
        if(isCard(card)) {
          this.router.navigate(["card", card.cardInfo.id]);
          return;
        }
        this.router.navigate(["card", "unlocked", card.id]);
      } break;
      case "upgrade": {
        if(card == null || isCard(card)) throw new Error("card is not UnlockedCard");
        this.router.navigate(["card", "unlocked", card.id, "upgrade"]);
      } break;
      case "event": {
        this.clickEvent.emit();
      } break;
    }
  }
}
