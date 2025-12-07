import type { Collector } from '../../../shared/types';

export interface CollectorsIndexResponse {
    pageSize: number,
    page: number,
    collectorCount: number,
    collectors: Collector[],
}
