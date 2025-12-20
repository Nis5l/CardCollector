import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Observable,  BehaviorSubject } from 'rxjs';
import type { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

import type { UnlockedCard, Card } from '../../types';
import { CardService } from './card.service';

function isCard(card: UnlockedCard | Card): card is Card {
	return !("id" in card);
}

@Component({
    selector: 'cc-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    standalone: false
})
export class CardComponent {
	private readonly cardSubject: BehaviorSubject<UnlockedCard | Card | null> = new BehaviorSubject<UnlockedCard | Card | null>(null);
	public readonly card$: Observable<UnlockedCard | Card | null>;
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

	@Input()
	public cardImage: string | SafeResourceUrl | null = null;

  @Input()
  public click: "none" | "upgrade" | "event" | "navigate" = "none";

  @Input()
  public suggestion: boolean = false;

	constructor(
    private readonly cardService: CardService,
    private readonly router: Router,
  ) {
		this.card$ = this.cardSubject.asObservable();
	}

	public getCardEffectImage(card: Card | UnlockedCard | null): string | null {
		if(card == null || isCard(card)) return null;
		return card.cardEffect?.image ?? null;
	}

	public getCardImage(card: Card | UnlockedCard | null): string | SafeResourceUrl | null {
    if(card == null) return null;
		if(this.cardImage) return this.cardImage;
		return this.cardService.getCardImage((isCard(card) ? card : card.card).cardInfo.id);
	}

	public getCardName(card: Card | UnlockedCard | null): string {
    if(card == null) return "";
		return (isCard(card) ? card : card.card).cardInfo.name;
	}

	public getCardTypeName(card: Card | UnlockedCard | null): string {
    if(card == null) return "";
		return (isCard(card) ? card : card.card).cardType.name;
	}

	public getCardFrameFront(card: Card | UnlockedCard | null): string {
		if(card == null || isCard(card) || card.cardFrame == null) return this.cardService.getDefaultCardFrameFront();
		return this.cardService.getCardFrameFront(card.cardFrame.id);
	}

	public getCardFrameBack(card: Card | UnlockedCard | null): string {
		if(card == null || isCard(card) || card.cardFrame == null) return this.cardService.getDefaultCardFrameBack();
		return this.cardService.getCardFrameBack(card.cardFrame.id);
	}

  public getCardLevel(card: Card | UnlockedCard | null): string | null {
    if(card == null || isCard(card)) return null;
    return card.level.toString();
  }

  public getCardQuality(card: Card | UnlockedCard | null): string | null {
    if(card == null || isCard(card)) return null;
    return card.quality.toString();
  }

  public onClick(card: Card | UnlockedCard | null): void {
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
