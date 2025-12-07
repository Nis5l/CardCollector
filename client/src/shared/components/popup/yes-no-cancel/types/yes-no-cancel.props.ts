import type { YesNoProps } from '../../yes-no/types';

export interface YesNoCancelProps extends YesNoProps {
    disableYes: boolean,
    cancelCallback: () => void
}
