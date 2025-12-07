import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroller'

import { AbstractComponent } from '../../shared/abstract'
import { ScrollbarComponent, LoadingComponent } from '../../shared/components'
import UserBannerComponent from './user-banner'
import Config from '../../config.json'
import { withAuth, withAxiosPrivate } from '../../hooks'
import { UsersProps, UsersState } from './types';

import './users.component.scss'

class UsersComponent extends AbstractComponent<UsersProps, UsersState> {
  private page: number;
  private loading: boolean;
  private hasMore: boolean;

  private username: string;

  constructor(props: UsersProps) {
    super(props);

    this.page = 0;
    this.loading = false;
    this.hasMore = true;

    this.username = "";

    this.state =
    {
      users: [],
      friends: new Map<number, number>(),
      loading: true
    }
  }

  search(e: any) {
    this.page = 0;
    this.loading = false;
    this.hasMore = true;
    this.username = e.target.value;
    this.setState({users: []});
  }

  componentDidMount() {
    this.props.axios.get(`/user/${this.props.auth.id}/friends`)
      .then((res: any) => {
        this.setState({loading: false});
		let friends: Map<number, number> = new Map<number, number>();
		for (let i = 0; i < res.data.friends.length; i++) {
			friends.set(res.data.friends[i].userID,  res.data.friends[i].status);
			this.setState({friends: friends});
		}
      }).catch((err: any) => {
		console.log("Unexpected /user/:id/friends error");
	  });
  }

  trackScrolling = () => {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    axios.get(`${Config.API_HOST}/users?username=${this.username}&page=${this.page}`)
      .then(res => {
          if (!this.loading) return;
          if (res.data.length === 0) this.hasMore = false;
          this.loading = false;
          this.page++;
          const users = [...this.state.users, ...res.data];
          this.setState({users: users});
      });
  }

  getFriend(id: number): number {
    const friendId: number | undefined = this.state.friends.get(id);
    return friendId != null ? friendId : 0;
  }

  render() {


    return (
      <div className="users_wrapper">
        <LoadingComponent loading={this.state.loading} />
        <div className="users_input">
          <input onChange={(e) => {this.search(e)}} type="text" className="text_input" placeholder="Username" />
        </div>
        <div className="users">
          <ScrollbarComponent>
            <InfiniteScroll
              pageStart={0}
              loadMore={this.trackScrolling}
              hasMore={true}
              className="banner_wrapper"
              useWindow={false}
            >
              {
                this.state.users.map((user) => (
                  <UserBannerComponent
                    username={user.username}
                    badges={user.badges}
                    userID={user.id}
                    key={"user-" + user.id + "-" + this.getFriend(user.id)}
                    friend={this.getFriend(user.id)} />
                ))
              }
            </InfiniteScroll>
          </ScrollbarComponent>
        </div>
      </div >
    )
  }

}

export default withAuth(withAxiosPrivate(UsersComponent));
