import { AbstractComponent } from '../../abstract';
import { YesNoComponent } from '../popup';
import FriendComponent from './friend';
import ScrollbarComponent from '../scrollbar'
import { withAxiosPrivate, withRouter } from '../../../hooks'
import { FriendListState, FriendListProps } from './types';

import './friend-list.component.scss'

class FriendListComponent extends AbstractComponent<FriendListProps, FriendListState> {
    public props: FriendListProps;

    private lcounter: number;
    private lcounterMax: number;

    private resizeMethod: () => void;

    public componentMounted: boolean = false;

    constructor(props: FriendListProps) {
        super(props);
        this.props = props;

        this.lcounter = 0;
        this.lcounterMax = 1;

        this.resizeMethod = () => {
            this.setState({width: window.screen.availWidth});
        }

        this.state =
        {
            friends: [],
            friendRequests: [],
            width: window.screen.availWidth,
            deleteUser: undefined
        }
    }

    componentDidMount() {
        this.componentMounted = true;

        async function loadFriends(self: FriendListComponent) {
			try {
				const response = await self.props.axios.get(`/user/${self.props.userId}/friends`);
				return response.data;
			} catch (err) {
				console.log("Unexpected /user/:id/friends error");
                return [];
			}
        }

        async function fetchData(self: FriendListComponent) {

            let friends = await loadFriends(self);
            const filteredFriends = friends.filter((friend: any) => friend.status === 0);
            if (self.props.onFriendRequests) {
                const friendrqs = friends.filter((friend: any) => friend.status === 1);
                if(self.componentMounted) self.setState({friendRequests: friendrqs});
                self.props.onFriendRequests(friendrqs.length);
            }

            if(self.componentMounted){
                self.setState({friends: filteredFriends});
                self.incrementLCounter();
            }

            if (self.props.onFriendData) self.props.onFriendData(friends);
        }

        fetchData(this);

        window.addEventListener('resize', this.resizeMethod);
    }

    componentWillUnmount() {
        this.componentMounted = false;
        window.removeEventListener('resize', this.resizeMethod);
    }

    incrementLCounter() {
        this.lcounter++;
        if (this.lcounter === this.lcounterMax && this.props.lCallback) this.props.lCallback();
    }

    deleteFriend(userId: string) {
        const data = {
            userId: userId
        }
        this.props.axios.post(`/friend/remove`, data);

        for (let i = 0; i < this.state.friends.length; i++) {
            if (this.state.friends[i].userId === userId) {
                this.state.friends.splice(i, 1);
                this.setState({friends: [...this.state.friends]});
                break;
            }
        }

        for (let i = 0; i < this.state.friendRequests.length; i++) {
            if (this.state.friendRequests[i].userId === userId) {
                this.state.friendRequests.splice(i, 1);
                this.setState({friendRequests: [...this.state.friendRequests]});
                break;
            }
        }
    }

    onDecline(userId: string) {
        this.deleteFriend(userId);
		if(this.props.onFriendRequests) this.props.onFriendRequests(this.state.friendRequests.length);
    }

    onAccept(userId: string) {
        const data = {
            userId: userId
        }
        this.props.axios.post(`/friend/accept`, data);

        for (let i = 0; i < this.state.friendRequests.length; i++) {
            if (this.state.friendRequests[i].userId === userId) {
                this.state.friends.push(this.state.friendRequests[i])
                let newreq = this.state.friendRequests[i];
                newreq.status = 0;
                this.state.friendRequests.splice(i, 1);
                this.setState({friends: [...this.state.friends], friendRequests: [...this.state.friendRequests]});
                break;
            }
        }

		if(this.props.onFriendRequests) this.props.onFriendRequests(this.state.friendRequests.length);
    }

    render() {
        if (this.props.userId === undefined) return (<div className="friendslist"></div>);

        let inner = (
            <div className="friendRequests">
                <ul className={this.props.requests ? "hideFriends" : "showFriends"}>
                    {this.state.friends.map((friend) => {
                        return (
                            <FriendComponent
                                key={friend.userId}

                                avatar="/assets/Icon.png"
                                userId={friend.userId}
                                status={friend.status}
                                username={friend.username}
                                onDelete={(userId: string, username: string) => { this.setState({ deleteUser: { userId, username: username } }) } }
                                />
                        )

                    })}
                </ul>
                <ul className={this.props.requests ? "showFriends" : "hideFriends"}>
                    {this.state.friendRequests.map((friend) => {

                        return (
                            <FriendComponent
                                key={friend.userId}

                                avatar="/assets/Icon.png"
                                userId={friend.userId}
                                status={friend.status}
                                username={friend.username}
                                onAccept={(userId: string) => this.onAccept(userId)}
                                onDecline={(userId: string) => this.onDecline(userId)}
                                />
                        )

                    })}

                </ul>
            </div >
        )

        return (

            < div
                className="friendslist"
            >

                {
                    this.state.deleteUser !== undefined &&
                    <YesNoComponent
                        text={`Remove ${this.state.deleteUser.username}?`}
                        yesCallback={() => { if(this.state.deleteUser != null) this.deleteFriend(this.state.deleteUser.userId); this.setState({deleteUser: undefined});}}
                        noCallback={() => this.setState({deleteUser: undefined})}
                    />
                }

                {
                    this.state.width > 768 ?
                        <ScrollbarComponent>
                            {inner}
                        </ScrollbarComponent>
                        :
                        inner
                }

            </div >

        )
    }
}

export default withAxiosPrivate(withRouter(FriendListComponent));
