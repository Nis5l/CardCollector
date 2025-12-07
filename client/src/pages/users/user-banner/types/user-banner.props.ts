import type { Badge } from './user-banner-badge.type';

export interface UserBannerProps {
    userID: number;
    username: string;
    friend: number;
    badges: Badge[];
}
