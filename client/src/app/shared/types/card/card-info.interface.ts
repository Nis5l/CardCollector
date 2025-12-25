import type { Id } from '../id.interface';
import { CardState } from './card-state.enum';

export interface CardInfo {
    id: Id,
	  userId: Id | null | undefined,
    name: string,
    time: string,
    state: CardState,
}
