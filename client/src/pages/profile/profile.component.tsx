import { AbstractComponent } from '../../shared/abstract'
import { CardComponent, LogoComponent, LoadingComponent, GameCardComponent, GameCardLoadComponent } from '../../shared/components'
import { AchievementsComponent, ScrollbarComponent, ProfileNameComponent, FriendListComponent } from '../../shared/components';
import { withAxiosPrivate, withAuth, withRouter } from '../../hooks'
import type { ProfileProps, ProfileState } from './types';
import { parseCards } from '../../utils';

import "./profile.component.scss"

const collector: string = "xxxxxxxxxxxxx";

class ProfileComponent extends AbstractComponent<ProfileProps, ProfileState> {
    private userId: string;
    private lcounter: number;
    private lcounterMax: number;

    constructor(props: ProfileProps) {
        super(props);

        this.userId = props.router.params.id != null ? props.router.params.id : "";

        this.lcounter = 0;
        this.lcounterMax = 2;

        this.state =
        {
			stats: {friends: 0, maxFriends: 0, cards: 0, maxCards: 0, trades: 0, maxTrades: 0, achievements: []},
            friendStatus: -1,
            loading: true,
            flexCards: []
        }
    }

    componentDidMount() {

        async function loadStats(self: ProfileComponent, userId: string) {
			try {
				const reponse = await self.props.axios.get(`/user/${userId}/stats`);
                return reponse.data;
			} catch (err) {
				console.log("Unexpected /user/:id/stats error");
				return [];
			}
        }

        async function loadFlexCards(self: ProfileComponent, userId: string) {
			try {
				const res = await self.props.axios.get(`/user/${userId}/${collector}/flex`)
                parseCards(res.data);
                return res.data;
			} catch (err) {
				return [];
			}
        }

        async function updateStats(self: ProfileComponent) {

            const stats = await loadStats(self, self.userId);

            const cards = await loadFlexCards(self, self.userId);

            self.setState({stats: stats, flexCards: cards});
            self.incrementLCounter();
        }

        updateStats(this);

    }

    onFriendData(data: any) {
        this.incrementLCounter();
        if(this.props.auth == null) return;

        const ownID = this.props.auth.id;

        let status = -1;

        if (ownID == null || ownID === this.userId) {
            this.setState({friendStatus: 3});
            return;
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i].userId === ownID) {
                status = data[i].status;
                break;
            }
        }

        this.setState({friendStatus: status});
    }

    onFriendAdd() {
        const data = {
            userId: this.userId
        };
        this.props.axios.post(`/friend/add`, data);
        this.setState({friendStatus: 2});
    }

    incrementLCounter() {
        this.lcounter++;
        if (this.lcounter === this.lcounterMax) this.setState({loading: false});
    }

    render() {
        let icon = "";
        let onIconClick = () => {}

        if(this.props.auth != null){
            if (this.state.friendStatus === -1) {
                icon = "fa-user-plus";
                onIconClick = () => this.onFriendAdd();
            }
            else if (this.state.friendStatus === 0) {
                icon = "fa-handshake";
                onIconClick = () => {this.props.router.navigate(`/trade/${this.userId}`)}
            }
        }

        let cardsize = 0.54;
        let w = window.innerWidth;
        if (w > 2000)
            cardsize = 0.7;

        return (
            <div className="container_profile">

                <LoadingComponent loading={this.state.loading} />

                <CardComponent
                    title="Account Info"
                    styleClassName="accountInfo"
                    icon={icon}
                    onIconClick={onIconClick} iconNum={0} onClick={function (event: any): void {} }
                >

                    <div className="avatar">

                        <LogoComponent className="logo" size="" />

                    </div>

                    <div className="profilename_container">

                        <ProfileNameComponent
                            userId={this.userId}
                            username={''}
                            badges={undefined}
                            loadingCallback={function (): void {} }
                        />

                    </div>

                    <table className="stats">

                        <tbody>

                            <tr>

                                <td>Friends:</td>
                                <td>{`${this.state.stats.friends}/${this.state.stats.maxFriends}`}</td>

                            </tr>

                        </tbody>

                    </table>

                </CardComponent>

                <CardComponent
                    title="Achievements"
                    styleClassName="badges"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {} }
                    onClick={function (event: any): void {} }
                >
					<AchievementsComponent achievements={this.state.stats.achievements} />
                </CardComponent>

                <CardComponent
                    title="Best Waifu"
                    styleClassName="flexen"
                    icon={''}
                    iconNum={0}
                    onIconClick={function (): void {} }
                    onClick={function (event: any): void {} }
                >
                    <div className="flex-grid">
                        <ScrollbarComponent>
                            {
                                this.state.flexCards.map((card) => (
                                    <div className="waifucard_wrapper" key={"card-" + card.id}>
                                        <GameCardComponent
                                            card={card}
                                            size={cardsize}
                                            clickable="false"
                                        />
                                    </div>
                                ))
                            }
                        </ScrollbarComponent>
                    </div>

                </CardComponent>

                <div className="friends_wrapper">
                    <CardComponent
                        title="Friends"
                        styleClassName="friends"
                        icon={''}
                        iconNum={0}
                        onIconClick={function (): void {} }
                        onClick={function (event: any): void {} }
                    >

                        <FriendListComponent
                            userId={this.userId}
                            onFriendData={(data: any) => this.onFriendData(data)}
                        />

                    </CardComponent>
                </div>

            </div>

        )

    }
}

export default withAxiosPrivate(withAuth(withRouter(ProfileComponent)));
