import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { UnlockedCard, Card, Id, IdInt } from '../../types';
import { HttpService } from '../../services';

@Injectable()
export class CardService {
	constructor(private readonly httpService: HttpService) {}

	public getUnlockedCard(id: string): Observable<UnlockedCard> {
		return this.httpService.get<UnlockedCard>(`/card/unlocked/${id}`);
	}

	public getCard(id: string): Observable<Card> {
		return this.httpService.get<Card>(`/card/${id}`);
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
