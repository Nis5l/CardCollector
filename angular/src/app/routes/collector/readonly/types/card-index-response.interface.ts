import type { Card } from '../../../../shared/types';

export interface CardIndexResponse {
    pageSize: number,
    page: number,
    cardCount: number,
    cards: Card[],
}
