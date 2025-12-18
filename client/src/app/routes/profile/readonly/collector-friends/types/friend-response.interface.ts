import type { User } from '../../../../../shared/types/user';
import { FriendStatus } from '../../../shared/types';

export interface FriendResponse {
  user: User,
  status: FriendStatus
}
