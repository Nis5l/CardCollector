import type { Card } from './card.interface';

export interface CardIndexResponse {
    pageSize: number,
    page: number,
    cardCount: number,
    cards: Card[],
}
