import type { UnlockedCard } from './card';

export interface InventoryResponse {
    pageSize: number,
    page: number,
    cardCount: number,
    cards: UnlockedCard[],
}
