import { AbstractComponent } from '../../../../shared/abstract';
import Inventory from '../../inventory'
import { redirectIfNecessary } from '../../../../api'
import { withAxiosPrivate, withAuth, withRouter } from '../../../../hooks'
import type { SuggestInventoryProps, SuggestInventoryState } from './types';

class SuggestInventoryComponent extends AbstractComponent<SuggestInventoryProps, SuggestInventoryState> {
  private friendID: string;

  constructor(props: SuggestInventoryProps) {
    super(props);

    this.friendID = props.router.params.id != null ? props.router.params.id : "";

    this.state = {
      error: undefined,
      loading: false
    }
  }

  onCardClick(self: SuggestInventoryComponent, e: any, card: any) {
    self.setState({loading: true});

    this.props.axios.post(`/trade/${this.friendID}/suggestion/add/${card}`, {})
      .then((res: any) => {
        this.setState({loading: false});
		    self.props.router.navigate(`/trade/${this.friendID}`);
      }).catch((err: any) => {
        if (redirectIfNecessary(this.props.router.navigate, err)) return 1;

		if(err.response.data.error)
			self.setState({error: "Error: " + err.response.data.error});
		else
			self.setState({error: "Error: Internal Error"});
	  });
  }

  render() {
    const userID: string = this.props.auth != null ? this.props.auth.id : "";

    return (
      <div className="tradeinventory_wrapper">
        {
          this.state.error === undefined &&
          < Inventory
            loading={this.state.loading}
            redirect={false}
            userID={this.friendID}
            friendID={userID}
            excludeSuggestions={true}
            onCardClick={(e: any, card: any) => {this.onCardClick(this, e, card)}}
          />
        }
        {
          this.state.error !== undefined && <h1>{this.state.error}</h1>
        }
      </div>
    )
  }
}

export default withAxiosPrivate(withAuth(withRouter(SuggestInventoryComponent)));
