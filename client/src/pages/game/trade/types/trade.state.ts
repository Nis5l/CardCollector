import type { GameCard } from "../../../../shared/types";

export interface TradeState {
  name: string;
  cards: GameCard[];
  friendcards: GameCard[];
  found: boolean;
  info: string;
  friendinfo: string;
  tradeCount: number;
  friendTradeCount: number;
  tradeLimit: number;
  tradeTime: number;
  cardSuggestions: GameCard[];
  friendCardSuggestions: GameCard[];
  confirmed: number;
  friendConfirmed: number;

  removeId: string | undefined;
  removeFriendSuggestionId: string | undefined;
  removeSuggestionId: string | undefined;

  disabled: string | undefined;
  confirmdisabled: string | undefined;

  loading: boolean;
}
