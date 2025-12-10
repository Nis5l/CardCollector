import { Subject } from 'rxjs';

export interface Popup{
  readonly closeSubject?: Subject<void> | undefined;
	onOpen: () => void;
	onClose: () => void;
}
