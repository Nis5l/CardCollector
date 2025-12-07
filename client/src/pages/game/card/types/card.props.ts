import type { AxiosPrivateProps, AuthProps, ReactRouterProps } from '../../../../hooks'

export interface CardProps extends ReactRouterProps, AuthProps, AxiosPrivateProps {
  history: any
}
