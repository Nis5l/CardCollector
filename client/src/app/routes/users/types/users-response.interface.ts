import type { UserResponse } from './user-response.interface';

export interface UsersResponse {
    users: UserResponse[],
    pageSize: number,
    page: number,
    userCount: number,
}
