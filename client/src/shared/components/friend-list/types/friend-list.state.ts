interface User {
    userId: string,
    username: string
}

export interface FriendListState {
    friends: any[],
    friendRequests: any[],
    width: number,
    deleteUser?: User;
}
