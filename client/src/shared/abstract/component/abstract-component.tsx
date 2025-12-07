import { Component } from 'react';

export default abstract class AbstractComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {
	private _isMounted: boolean = true;
	protected get isMounted(): boolean {
		return this._isMounted;
	}
	private set isMounted(isMounted: boolean) {
		this._isMounted = isMounted;
	}

	componentWillUnmount(): void {
		this.isMounted = false;
	}
}
