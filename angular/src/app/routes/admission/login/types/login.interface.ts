import type { Id } from '../../../../shared/types';

export interface LoginRequest {
	username: string,
	password: string,
}

export interface LoginResponse {
    accessToken: string,
    userId: Id,
    username: String,
    role: number,
}
