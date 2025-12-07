import type { AxiosPrivateProps, ReactRouterProps } from '../../../../hooks'

export interface FriendListProps extends ReactRouterProps, AxiosPrivateProps {
    userId: string,
    requests?: boolean,
    onFriendRequests?: (len: number) => void,
    onFriendData?: (friends: any[]) => void,
    lCallback?: () => void
}
