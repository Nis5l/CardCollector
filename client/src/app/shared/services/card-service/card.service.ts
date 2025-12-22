import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { UnlockedCard, Card, Id, IdInt, CardIndexResponse, CardConfig, CardTypeConfig, CardTypeIndexResponse } from '../../types';
import { CardState, CardSortType, CardTypeSortType } from '../../types';
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

	public setCardImage(cardId: Id, image: File): Observable<unknown> {
		return this.httpService.putFile<unknown>(`/card/${cardId}/card-image`, image);
	}

	public getCardConfig(): Observable<CardConfig> {
		return this.httpService.get<CardConfig>("/card/config");
	}

	public getCardTypeConfig(): Observable<CardTypeConfig> {
		return this.httpService.get<CardTypeConfig>("/card-type/config");
	}

	public getCardTypes(collectorId: Id, name: string, page: number, state: CardState | null | undefined, sortType: CardTypeSortType): Observable<CardTypeIndexResponse> {
		let params = new HttpParams().set('name', name).set('sort_type', sortType);
    if(state != null) params = params.set('state', state);
		return this.httpService.get(`/${collectorId}/card-type`, params);
	}
}
