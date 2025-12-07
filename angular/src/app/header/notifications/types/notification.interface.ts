import type { Id, IdInt } from '../../../shared/types';

export interface Notification {
	id: IdInt,
	user_id: Id,
	title: string,
	message: string,
	url: string,
	time: Date
}
