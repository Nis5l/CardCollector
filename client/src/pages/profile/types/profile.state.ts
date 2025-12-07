export interface ProfileState {
    stats: {
        friends: number;
        maxFriends: number;
        cards: number;
        maxCards: number;
        trades: number;
        maxTrades: number;
        achievements: any;
    };
    friendStatus: number;
    loading: boolean;
    flexCards: any[];
}
