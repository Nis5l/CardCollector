import type { Id } from '../id.interface';
import { CardState } from './card-state.enum';

export interface CardInfo {
    id: Id,
	userId: Id,
    name: string,
    time: string,
    state: CardState,
}
