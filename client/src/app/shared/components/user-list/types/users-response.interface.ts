import type { User } from '../../../types/user';

export interface UsersResponse {
    users: User[],
    pageSize: number,
    page: number,
    userCount: number,
}
