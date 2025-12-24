import type { Id } from '../../../../../../shared/types';

export interface CardUpdateRequest {
  cardId: Id,
  name: String,
  cardType: Id,
}
