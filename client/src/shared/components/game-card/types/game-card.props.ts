import type { ReactRouterProps } from '../../../../hooks'
import type { GameCard } from '../../../types';

export interface GameCardProps extends ReactRouterProps {
	card: GameCard;
	turned: boolean;
	clickable: boolean;
	redirects: boolean;
	cardColor: string;
	size: number;
	identifier: string;
	onTurn?: (e: React.MouseEvent, uuid?: string) => void;
	onClick?: (e: React.MouseEvent, uuid?: string) => void;
	onCreate?: () => void;
}
