import type { Id } from './id.interface';

export interface Collector {
    id: Id,
    name: string,
    description: string,
    userId: Id
}
