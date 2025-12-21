import type { Id, IdInt } from '../../../shared/types';

export interface Notification {
	id: IdInt,
	userId: Id,
	title: string,
	message: string,
	url: string,
	time: Date
}
