import type { Collector } from "../../../../../shared/types";

export interface CollectorProps {
    collector: Collector,
    onClick?: (collector: Collector) => void
};
