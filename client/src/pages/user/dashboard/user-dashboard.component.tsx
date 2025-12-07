import { withAuth, withAxiosPrivate } from '../../../hooks';
import { AbstractLoadingComponent } from '../../../shared/abstract';
import { AchievementsComponent, CardComponent, FriendListComponent, ProfileImageComponent, ProfileNameComponent } from '../../../shared/components';
import type { UserDashboardProps, UserDashboardState } from './types';
import UserInfoComponent from './user-info';

import './user-dashboard.component.scss';

class UserDashboardComponent extends AbstractLoadingComponent<UserDashboardProps, UserDashboardState>{
	protected readonly renderLoad = true;
	protected readonly loadLimit = 1;
	private readonly userId: string;

	constructor(props: UserDashboardProps) {
		super(props);
		this.userId = props.auth.id;

		this.state = {
			friendListState: "friend",
			loading: true,
		};
	}

	public async componentDidMount() {
		const stats = (await this.props.axios.get(`/user/${this.userId}/stats`)).data;
		this.setState(stats);
		this.incrementLoadCount();
	}

	public override render() {
		return (
			<>
				<div className="container">
					<CardComponent
						title="Account Info"
						styleClassName="user-info"
						>
						<UserInfoComponent
							userId={this.userId}
							friends={this.state.friends}
							maxFriends={this.state.maxFriends}
						/>
					</CardComponent>
					<CardComponent
						title="Achievements"
						styleClassName="achievements"
						>
						<AchievementsComponent
							achievements={this.state.achievements ?? []}
						/>
					</CardComponent>
					<CardComponent
						title="Friends"
						styleClassName="friends"
						icon={this.state.friendListState === "friendRequests" ? "fa-user-friends" : "fa-user"}
						iconNum={this.state.friendListState === "friendRequests" || this.state.friendRequestCount == null ? 0 : this.state.friendRequestCount}
						onIconClick={() => this.toggleFriendListState() }
					>
						<FriendListComponent
							userId={this.userId}
							loadingCallback={() => { this.incrementLoadCount(); } }
							onFriendRequests={(friendRequestCount: number) => { if(this.isMounted) { this.setState({ friendRequestCount }); } } }
							requests={this.state.friendListState === "friendRequests"}
						/>
					</CardComponent>
				</div>
			</>
		)
	}

	private toggleFriendListState(): void {
		const state = this.state.friendListState === "friend" ? "friendRequests" : "friend";
		this.setState({friendListState: state});
	}
}


export default withAuth(withAxiosPrivate(UserDashboardComponent));
