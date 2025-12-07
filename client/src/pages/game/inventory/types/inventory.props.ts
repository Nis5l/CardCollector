import type { ReactRouterProps, AxiosPrivateProps, AuthProps } from '../../../../hooks'

export interface InventoryProps extends ReactRouterProps, AuthProps, AxiosPrivateProps {
  userID: string;
  friendID?: string;
  excludeSuggestions?: boolean;
  redirect?: boolean;
  loading?: boolean;
  onCardClick?: (e: any, card: any) => void;
}
