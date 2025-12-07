import type { Id } from '../../../../../shared/types';
import { FriendStatus } from '../../../shared/types';

export interface FriendResponse {
    userId: Id,
    username: String,
    status: FriendStatus
}
