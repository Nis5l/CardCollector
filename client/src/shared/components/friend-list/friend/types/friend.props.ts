import type { ReactRouterProps } from '../../../../../hooks'

export interface FriendProps extends ReactRouterProps {
    userId: string;
    username: string;
    status: number;
    avatar: string;
    onDelete?: (userId: string, username: string) => void;
    onAccept?: (userId: string) => void;
    onDecline?: (userId: string) => void;
}

