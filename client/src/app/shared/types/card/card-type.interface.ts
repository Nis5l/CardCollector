import type { Id } from '../id.interface';

export interface CardType {
    id: Id,
    name: string,
	userId: Id | null | undefined,
}
