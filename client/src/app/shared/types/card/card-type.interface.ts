import type { Id } from '../id.interface';
import { CardState } from './card-state.enum';

export interface CardType {
  id: Id,
  name: string,
  userId: Id | null | undefined,
  state: CardState,
  updateCardType: CardType | null | undefined,
}
