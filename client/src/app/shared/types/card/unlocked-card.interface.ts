import type { Card } from './card.interface';
import type { CardFrame } from './card-frame.interface';
import type { CardEffect } from './card-effect.interface';
import type { Id } from '../id.interface';

export interface UnlockedCard {
    id: Id,
    userId: Id,
    level: number,
    quality: number,

	cardFrame: CardFrame | null | undefined,
	cardEffect: CardEffect | null | undefined

	card: Card,
}
