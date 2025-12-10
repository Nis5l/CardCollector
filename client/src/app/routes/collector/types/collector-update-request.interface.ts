import type { Id } from '../../../shared/types';

export interface CollectorUpdateRequest {
    id: Id,
    name: string,
    description: string
}
