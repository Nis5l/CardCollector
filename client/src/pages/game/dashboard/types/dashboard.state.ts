import { LoadingComponentState } from "../../../../shared/abstract/loading-component";

export interface DashboardState extends LoadingComponentState {
    userId: string;
    friends: number;
    maxFriends: number;
    cards: number;
    maxCards: number;
    trades: number;
    maxTrades: number;
    friendRequests: number;
    achievements: any[];
    requests: boolean;
}
