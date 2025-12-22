import type { CardType } from '../../../shared/types';

export interface CardTypeIndexResponse {
    pageSize: number,
    page: number,
    cardTypeCount: number,
    cardTypes: CardType[],
}
