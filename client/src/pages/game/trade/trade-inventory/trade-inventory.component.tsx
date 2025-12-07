import Inventory from '../../inventory'
import { redirectIfNecessary } from '../../../../api'

import { AbstractComponent } from '../../../../shared/abstract';
import { withAxiosPrivate, withAuth, withRouter } from '../../../../hooks'
import type { TradeInventoryProps, TradeInventoryState } from './types';

import './trade-inventory.component.scss'

class TradeInventoryComponent extends AbstractComponent<TradeInventoryProps, TradeInventoryState> {
  private friendID: string = "";
  
  constructor(props: TradeInventoryProps) {
    super(props);

    const friendID = props.router.params.id;
    if(friendID != null) this.friendID = friendID;

    this.state = {
      error: undefined,
      loading: false
    }
  }

  onCardClick(self: TradeInventoryComponent, e: any, card: any) {
    self.setState({loading: true});

    this.props.axios.post(`/trade/${this.friendID}/card/add/${card}`, {})
      .then((res: any) => {
    	  self.props.router.navigate(`/trade/${this.friendID}`);
      }).catch((err: any) => {
          if (redirectIfNecessary(this.props.router.navigate, err)) return;
          self.setState({error: "Error: Internal Error"});
	  });
  }

  render() {
    const userID = this.props.auth.id;
    
    return (
      <div className="tradeinventory_wrapper">
        {
          this.state.error === undefined &&
          < Inventory
            redirect={false}
            userID={parseInt(userID != null ? userID : "")}
            friendID={this.friendID}
            loading={this.state.loading}
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

export default withAxiosPrivate(withAuth(withRouter(TradeInventoryComponent)));
