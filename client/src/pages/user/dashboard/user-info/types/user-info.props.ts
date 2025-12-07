import type { LoadingComponentProps } from '../../../../../shared/abstract/loading-component';

export interface UserInfoProps extends LoadingComponentProps {
	userId: string;
	maxFriends?: number;
	friends?: number;
}
