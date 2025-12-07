import type { LoadingComponentProps } from '../../../abstract/loading-component';
import type { Badge } from '../badge';

export interface ProfileNameProps extends LoadingComponentProps {
    userId: string;
    username?: string;
    badges?: Badge[] | undefined;
}
