import type { UnlockedCard } from '../../../../../shared/types';
import { TradeStatus } from './trade-status.enum';

export interface TradeInfoResponse {
    selfCards: UnlockedCard[],
    friendCards: UnlockedCard[],
    selfCardSuggestions: UnlockedCard[],
    friendCardSuggestions: UnlockedCard[],
    friendUsername: String,
    selfStatus: TradeStatus,
    friendStatus: TradeStatus,
    tradeCardLimit: number,
    tradeTime: string
}
