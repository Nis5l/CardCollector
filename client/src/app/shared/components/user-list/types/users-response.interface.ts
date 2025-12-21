import type { User } from '../../../types';

export interface UsersResponse {
    users: User[],
    pageSize: number,
    page: number,
    userCount: number,
}
