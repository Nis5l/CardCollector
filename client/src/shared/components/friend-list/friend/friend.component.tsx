import React, {createRef, RefObject} from 'react'

import type { FriendState, FriendProps } from './types';
import ProfileNameComponent from '../../profile-name';
import { withRouter } from '../../../../hooks'
import ThreeDotsMenuComponent from '../../three-dots-menu';

class FriendComponent extends React.Component<FriendProps, FriendState> {
    private status: number;
    private onDelete: (userId: string, username: string) => void;
    private onAccept: (userId: string) => void;
    private onDecline: (userId: string) => void;

    private resizeMethod: () => void;

    private friendlist: RefObject<any>;

    constructor(props: FriendProps) {
        super(props);

        this.status = props.status;
        this.onDelete = props.onDelete != null ? props.onDelete : () => {};

        this.onAccept = props.onAccept != null ? props.onAccept : () => {};
        this.onDecline = props.onDecline != null ? props.onDecline : () => {};

        this.resizeMethod = () => {this.resize(this)};

        this.friendlist = createRef();

        this.state = {username: this.props.username}
    }

    onClick = (link: string) => {
        this.props.router.navigate(link);
    };

    componentDidMount() {
        window.addEventListener('resize', this.resizeMethod);
        window.addEventListener('load', this.resizeMethod);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeMethod);
        window.removeEventListener('load', this.resizeMethod);
    }

    resize(self: FriendComponent) {
        let username = self.props.username;
        if (this.friendlist.current.clientWidth <= 350) {
            if (this.friendlist.current.clientWidth <= 250) {
                if (username.length > 11) username = username.slice(0, 8) + "...";
            }
            else if (username.length > 15) username = username.slice(0, 12) + "...";
        }
        self.setState({username: username});
    }

    render() {

        let options = [];

        switch (this.status) {
            case 0:
                options.push(
                    {
                        name: "Trade",
                        onClick: () => this.onClick("/trade/" + this.props.userId)
                    }
                )
                options.push(
                    {
                        name: "Remove",
                        color: "#be0303",
                        onClick: () => {
                            if (this.onDelete) this.onDelete(this.props.userId, this.props.username);
                        }
                    }
                )
                break;
            default:
        }

        return (

            <li
                className="friend"
                ref={this.friendlist}
                style={{fontSize: this.friendlist.current !== null ? `min(18px, ${this.friendlist.current.clientWidth / 15}px)` : "18px"}}
            >

                <img
                    src={this.props.avatar}
                    alt="Friend Avatar"
                    style={{height: this.friendlist.current !== null ? `min(90%, ${this.friendlist.current.clientWidth / 5}px)` : "18px"}}
                />

                <ProfileNameComponent
                    userId={this.props.userId}
                    username={this.state.username}
                    badges={undefined}
                    loadingCallback={() => {}}
                />

                {
                    options.length > 0 ?
                        <ThreeDotsMenuComponent
                            menuID={("friendMenu-" + this.props.userId)}
                            options={options}
                        />
                        : (
                            <div className="icons">
                                <i className="fas fa-times" onClick={() => this.onDecline(this.props.userId)} />
                                <i className="fas fa-check" onClick={() => this.onAccept(this.props.userId)} />
                            </div>
                        )
                }
            </li>
        )
    }
}

export default withRouter(FriendComponent);
