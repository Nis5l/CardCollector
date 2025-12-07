import { AbstractLoadingComponent } from "../../../../shared/abstract";
import { ProfileImageComponent, ProfileNameComponent } from "../../../../shared/components";
import type { UserInfoProps } from './types';

import './user-info.component.scss';

export default class UserInfoComponent extends AbstractLoadingComponent<UserInfoProps> {
	protected readonly renderLoad = false;
	protected readonly loadLimit = 1;

	constructor(props: UserInfoProps) {
		super(props);
		this.state = {
			loading: true,
		};
	}

	public render() {
		return (
			<div className="user-info">
				<div className="avatar">
					{ /*<Logo className="logo" size="" />*/ }
					<ProfileImageComponent userId={this.props.userId}></ProfileImageComponent>
				</div>
				<div className="profile-name">
					<ProfileNameComponent
						userId={this.props.userId}
						loadingCallback={() => { this.incrementLoadCount(); } }
					/>
				</div>
				<table className="stats">
					<tbody>
						{ this.props.friends != null && this.props.maxFriends != null ?
							(<tr>
								<td>Friends:</td>
								<td>{`${this.props.friends}/${this.props.maxFriends}`}</td>
							</tr>) : null
						}
					</tbody>
				</table>
			</div>
		);
	}
}
