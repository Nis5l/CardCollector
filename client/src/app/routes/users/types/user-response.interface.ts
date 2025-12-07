import type { Id } from '../../../shared/types';
import type { Badge } from './badge.interface';

export interface UserResponse {
    id: Id,
    username: String,
    badges: Badge[]
}
