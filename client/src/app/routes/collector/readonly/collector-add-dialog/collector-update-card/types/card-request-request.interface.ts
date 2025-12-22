import type { Id } from '../../../../../../shared/types';

export interface CardRequestRequest {
  cardId: Id,
  name: String,
  cardType: Id,
}
