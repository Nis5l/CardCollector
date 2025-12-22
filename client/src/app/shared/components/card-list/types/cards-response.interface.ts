import type { Card } from '../../../types';

export interface CardsResponse {
    users: Card[],
    pageSize: number,
    page: number,
    userCount: number,
}
