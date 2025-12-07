import {lazy, Suspense} from 'react'

import { AchievementsComponent, ProfileImageComponent, CardComponent, LoadingComponent } from '../../../shared/components';
import { AbstractLoadingComponent } from '../../../shared/abstract';
import { withAxiosPrivate, withAuth, withRouter } from '../../../hooks';
import type { DashboardState, DashboardProps } from './types';

import "./dashboard.component.scss"

const FriendListComponent = lazy(() => import('../../../shared/components/friend-list'));
const PackProgressRingComponent = lazy(() => import('./pack-progress-ring'));
const ProfileNameComponent = lazy(() => import('../../../shared/components/profile-name'));

const loading = () => <p>Loading...</p>

class DashboardComponent extends AbstractLoadingComponent<DashboardProps, DashboardState> {
	protected readonly renderLoad = true;
	protected readonly loadLimit = 4;
    private collectorId: string;

    public componentMounted: boolean = false;

    constructor(props: DashboardProps) {
        super(props);

        this.collectorId = this.props.router.params.collector_id != null ? this.props.router.params.collector_id : "";

        this.state =
        {
            userId: this.props.auth != null ? this.props.auth.id : "",
            friends: 0,
            maxFriends: 0,
            cards: 0,
            maxCards: 0,
            trades: 0,
            maxTrades: 0,
            loading: true,
            friendRequests: 0,
			achievements: [],
            requests: false
        }
    }

    componentDidMount() {
        this.componentMounted = true;
        const loadStats = async (userId: string) => {
			try {
				const response = await this.props.axios.get(`/user/${userId}/stats`);
				return response.data;
			} catch (err) {
				return [];
			}
        }

        const updateStats = async () => {
            if(this.state.userId == null) return;

            const stats = await loadStats(this.state.userId);
            if(!this.componentMounted) return;

            this.incrementLoadCount();
            this.setState(stats);
        }

        this.props.axios.get(`/verify/check`)
            .then((res: any) => {
				switch (res.data.verified) {
					case 1:
						this.props.router.navigate('/verify');
						break;
					case 2:
						this.props.router.navigate('/verify/mail');
						break;
					default:
                        break;
				}
            }).catch((err: any) => {
				console.log("Unexpected /verify/check error");
			});;

        updateStats();
    }

    componentWillUnmount(){
        this.componentMounted = false;
    }

    friendPopup(self: DashboardComponent) {
        self.props.router.navigate("/users")
    }

    render() {
        return (
            <div className="container">
                <LoadingComponent loading={this.state.loading} />
                <CardComponent
                    title="Account Info"
                    styleClassName="accountInfo"
                    >
                    <div className="avatar">
                        { /*<Logo className="logo" size="" />*/ }
                        <ProfileImageComponent userId={this.props.auth.id}></ProfileImageComponent>
                    </div>
                    <div className="profilename_container">
                        <Suspense fallback={loading()}>
                            <ProfileNameComponent
                                userId={this.state.userId != null ? this.state.userId : ""}
                                loadingCallback={() => { this.incrementLoadCount(); } }
                            />
                        </Suspense>
                    </div>
                    <table className="stats">
                        <tbody>
                            <tr>
                                <td>Friends:</td>
                                <td>{`${this.state.friends}/${this.state.maxFriends}`}</td>
                            </tr>
                            <tr>
                                <td>Waifus:</td>
                                <td>{`${this.state.cards}/${this.state.maxCards}`}</td>
                            </tr>
                            <tr>
                                <td>Trades:</td>
                                <td>{`${this.state.trades}/${this.state.maxTrades}`}</td>
                            </tr>
                        </tbody>
                    </table>
                </CardComponent>
                <CardComponent
                    title="Achievements"
                    styleClassName="achievements"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {}}
                    onClick={function (event: any): void {} }
                    >
					<AchievementsComponent
						achievements={this.state.achievements}
					/>
                </CardComponent>
                <CardComponent
                    title="Packs"
                    styleClassName="packs"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {} }
                    onClick={function (event: any): void {} }
                    >
                    <div className="packs-grid">

                        <Suspense fallback={loading()}>
                            <PackProgressRingComponent
                                collectorId={this.collectorId}
                                className="pack1"
                                lCallback={() => {this.incrementLoadCount()}}
                            />
                        </Suspense>
                        {false && <Suspense fallback={loading()}>
                            <PackProgressRingComponent
                                collectorId={this.collectorId}
                                className="pack2"
                                lCallback={() => {this.incrementLoadCount()}}
                            />
                        </Suspense>}

                    </div>

                </CardComponent>
                <div className="friends_wrapper">
                    <CardComponent
                        title="Friends"
                        styleClassName="friends"
                        icon={this.state.requests ? "fa-user-friends" : "fa-user"}
                        iconNum={this.state.requests ? 0 : this.state.friendRequests}
                        onIconClick={() => { this.setState({ requests: !this.state.requests }); } }
                    >
                        <Suspense fallback={loading()}>
                            <FriendListComponent
                                userId={this.state.userId != null ? this.state.userId : ""}
                                lCallback={() => { this.incrementLoadCount(); } }
                                onFriendRequests={(count: number) => { if(this.componentMounted) { this.setState({ friendRequests: count }); } } }
                                requests={this.state.requests}
                                decrementRequests={() => { if(this.componentMounted) { this.setState({ friendRequests: this.state.friendRequests - 1 }); } } }
                            />
                        </Suspense>
                    </CardComponent>
                </div>
            </div>
        )
    }
}

export default withAuth(withAxiosPrivate(withRouter(DashboardComponent)));
