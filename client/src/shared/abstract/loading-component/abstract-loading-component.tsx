import AbstractComponent from '../component';
import { LoadingComponent } from "../../components";
import type { LoadingComponentState, LoadingComponentProps } from './types';

export default abstract class AbstractLoadingComponent<TProps extends LoadingComponentProps = LoadingComponentProps, TState extends LoadingComponentState = LoadingComponentState> extends AbstractComponent<TProps, TState> {
	protected abstract readonly loadLimit: number;
	protected abstract readonly renderLoad: boolean;
	protected loadCount = 0;

	constructor(props: TProps) {
		super(props);
	}

    protected incrementLoadCount() {
        this.loadCount++;
        if (this.loadCount === this.loadLimit) {
			this.setState({loading: false});
			if(this.props.loadingCallback != null)
				this.props.loadingCallback();
		}
    }

	public render() {
		return (
			<>
				{
					this.renderLoad ? <LoadingComponent loading={this.state.loading} /> : undefined
				}
			</>
		)
	}
}
