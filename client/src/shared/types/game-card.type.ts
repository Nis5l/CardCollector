export interface GameCard {
	id: string;
	userId: string;
	level: number;
	quality: number;
	cardInfo: {
		id: string;
		name: string;
		image: string;
	};
	cardFrame: {
		id: string;
		name: string;
		front: string;
		back: string;
	};
	cardType: {
		id: string;
		name: string;
	};
	cardEffect: {
		id: number;
		image: string;
		opacity: number;
	};
}
