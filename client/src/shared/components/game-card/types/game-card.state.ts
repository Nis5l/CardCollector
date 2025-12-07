import type { GameCard } from '../../../types';
import type { UpgradeEffect } from './upgrade-effect.type';

export interface GameCardState {
	card: GameCard;
	turned: boolean;
	clickable: boolean;
	redirects: boolean;
	cardColor: string;
	size: number;
	identifier: string;
	sizeMultiplier: number;
	focus: boolean;
	upgradeEffect?: UpgradeEffect;
}
