import type { Id } from '../../../shared/types';
import type { Badge } from './badge.interface';
import { UserRanking } from './user-ranking.enum';

export interface User {
    id: Id,
    username: string,
    badges: Badge[]
    ranking: UserRanking,
    time: string
}
