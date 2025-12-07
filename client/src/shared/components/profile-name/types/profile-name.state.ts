import type { Badge } from '../badge';
import type { LoadingComponentState } from '../../../../shared/abstract/loading-component';

export interface ProfileNameState extends LoadingComponentState {
	username?: string;
	badges?: Badge[];
}
