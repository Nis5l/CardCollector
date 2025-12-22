import { Component } from '@angular/core';

import type { UnlockedCard, CardInfo, CardFrame, CardType, CardEffect } from '../../shared/types/card';
import { CardState } from '../../shared/types/card';

@Component({
    selector: 'cc-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent {
	public cardData: UnlockedCard;

	constructor(){
    const nowStr = (new Date()).toISOString();
		let cardInfo: CardInfo = { id: "asd", userId: "userId", name: "Doggo?", time: nowStr, state: CardState.Created, updateCard: null };
		let cardType: CardType = { id: "asdss", name: "Doggies", userId: null, state: CardState.Created, updateCardType: null };
		let cardEffect: CardEffect = { id: 1, image: "http://localhost:8080/effect/Effect2.gif", opacity: 0.5 };
		this.cardData = {
			id: "id",
			userId: "userId",
			level: 1,
			quality: 1,
      time: nowStr,
			card: {
        collectorId: "collectorId",
				cardInfo,
				cardType
			},
			cardFrame: null,
			cardEffect
		};
	}
}
