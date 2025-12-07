import type { ReactRouterProps, AuthProps, AxiosPrivateProps } from '../../../../hooks';
import type { LoadingComponentProps } from '../../../../shared/abstract/loading-component';

export interface DashboardProps extends ReactRouterProps, AxiosPrivateProps, AuthProps, LoadingComponentProps {}
