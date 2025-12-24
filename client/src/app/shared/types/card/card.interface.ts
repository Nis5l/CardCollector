import type { CardInfo } from './card-info.interface';
import type { CardType } from './card-type.interface';
import type { Id } from '../id.interface';

export interface Card {
  collectorId: Id,
	cardInfo: CardInfo,
	cardType: CardType,
  updateCard: Card | null | undefined,
}
