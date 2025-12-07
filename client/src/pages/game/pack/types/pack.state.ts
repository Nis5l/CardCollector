import type { GameCard } from "../../../../shared/types";

export interface PackState {
    loading: boolean;
    cards: GameCard[];
}
