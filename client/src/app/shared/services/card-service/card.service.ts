import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { UnlockedCard, Card, Id, IdInt, CardIndexResponse } from '../../types';
import { CardState, CardSortType } from '../../types';
import { HttpService } from '../http-service';

@Injectable()
export class CardService {
	constructor(private readonly httpService: HttpService) {}

	public getUnlockedCard(id: Id): Observable<UnlockedCard> {
		return this.httpService.get<UnlockedCard>(`/card/unlocked/${id}`);
	}

	public getCard(id: Id): Observable<Card> {
		return this.httpService.get<Card>(`/card/${id}`);
	}

	public getCards(collectorId: string, search: string, page: number, state: CardState | null, sortType: CardSortType): Observable<CardIndexResponse> {
		let params = new HttpParams().set('search', search).set('page', page).set('sort_type', sortType);
    if (state != null) params.set('state', state)
		return this.httpService.get<CardIndexResponse>(`/${collectorId}/card`, params);
	}

	public getDefaultCardFrameFront(): string {
		return this.httpService.apiUrl("/card/card-frame-front");
	}

  public getCardFrameFront(id: IdInt): string {
		return this.httpService.apiUrl(`/card/${id}/card-frame-front`);
  }

	public getDefaultCardFrameBack(): string {
		return this.httpService.apiUrl("/card/card-frame-back");
	}

  public getCardFrameBack(id: IdInt): string {
		return this.httpService.apiUrl(`/card/${id}/card-frame-back`);
  }

	public getCardImage(cardId: Id): string {
		return this.httpService.apiUrl(`/card/${cardId}/card-image`);
	}
}
