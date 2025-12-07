import type { Achievement } from './achievement.interface';
import type { Collector } from '../../../../shared/types';

export interface Profile {
	username: string,
    maxFriends: number,
    friends: number,

    collectorFavorites: Collector[],

    achievements: Achievement[]
}
