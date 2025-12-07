import type { ReactRouterProps, AxiosPrivateProps } from '../../../../../hooks'

export interface PackProgressRingProps extends ReactRouterProps, AxiosPrivateProps {
    collectorId: string;
    className: string;
    lCallback: () => void;
}
