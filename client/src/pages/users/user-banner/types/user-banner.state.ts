import type { Badge } from './user-banner-badge.type';

export interface UserBannerState {
    userID: number;
    username: string;
    badges: Badge[];
    friend: number;
}
