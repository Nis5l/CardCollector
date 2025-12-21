import type { User } from '../../../../../shared/types';
import { FriendStatus } from '../../../shared/types';

export interface FriendResponse {
  user: User,
  status: FriendStatus
}
