import React, { RefObject} from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import Select from 'react-select'

import { AbstractComponent } from '../../../shared/abstract'
import { ScrollbarComponent, LoadingComponent, GameCardComponent } from '../../../shared/components'
import { redirectIfNecessary } from '../../../api'
import Config from '../../../config.json'
import { withAuth, withAxiosPrivate, withRouter } from '../../../hooks'
import { parseCards } from '../../../utils';
import type { InventoryState, InventoryProps } from './types';

import "./inventory.component.scss"

class InventoryComponent extends AbstractComponent<InventoryProps, InventoryState> {
  private key: number;
  private page: number;
  private userID: string;
  private friendID: string | undefined;
  private excludeSuggestions: boolean;
  private redirect: boolean;

  private lCounter: number;
  private lCounterMax: number;

  private hasMore: boolean;
  private loadingCards: boolean;

  private options: any[];

  private sortMethod: string | undefined;

  private onCardClick: (e: any, card: any) => void;

  private card_wrapper: RefObject<any>;
  private searchInput: RefObject<any>;

  private collectorID: string;
  
  constructor(props: InventoryProps) {
    super(props);

    this.card_wrapper = React.createRef();
    this.key = 0;
    this.page = 0;

    this.userID = props.userID;
    if (this.userID === undefined)
      this.userID = this.props.router.params.id != null ? this.props.router.params.id : "";
    if ((this.userID === undefined || this.userID === "") && props.auth != null) this.userID = props.auth.id;

    this.friendID = props.friendID;
    this.excludeSuggestions = this.props.excludeSuggestions === true;

    this.redirect =  props.redirect === false ? false : true;
    this.onCardClick = props.onCardClick != null ? props.onCardClick : () => {};

    this.lCounter = 0;
    this.lCounterMax = 1;

    this.hasMore = true;
    this.loadingCards = false;

    this.collectorID = this.props.router.params.collector_id != null ? this.props.router.params.collector_id : "";

    this.state =
    {
      cards: [],
      errorMessage: undefined,
      loading: true
    };
    this.options =
      [
        {value: 0, label: 'Name'},
        {value: 1, label: 'Level'},
        {value: 2, label: 'Recent'}
      ];

    this.searchInput = React.createRef();
    this.sortMethod = undefined;
  }

  trackScrolling = () => {
    if (this.card_wrapper == null || !this.hasMore || this.loadingCards) return;
    this.loadingCards = true;
    const search = this.searchInput.current.value;
    const sortType = this.sortMethod;

	let data: any = {
		page: this.page,
		search: search,
		sortType: sortType
	};
	
	if (this.friendID) {
    data.friend = {
			friendId: this.friendID,
			excludeSuggestions: this.excludeSuggestions
		};
  }

    this.props.axios.post(`${Config.API_HOST}/user/${this.userID}/${this.collectorID}/inventory`, data)
      .then((res: any) => {
        this.incrementLCounter();

        this.page++;

        parseCards(res.data);
        let cards = [...this.state.cards, ...res.data];
        this.key++;
        this.loadingCards = false;
        if (res.data.length === 0) this.hasMore = false;
        this.setState({cards: cards});
      }).catch((err: any) => {
          if (redirectIfNecessary(this.props.router.navigate, err)) return;
		  if(err.response)
			  this.setState({errorMessage: err.response.data.error});
		  else
			  this.setState({errorMessage: "Internal error"});
	  });
  }

  incrementLCounter() {
    this.lCounter++;
    if (this.lCounter === this.lCounterMax) this.setState({loading: false});
  }

  onFilter(e: any, obj: any) {
    if (e !== undefined) e.preventDefault();
    obj.key = 0;
    this.hasMore = true;
    this.page = 0;
    obj.setState({cards: []});
  }

  render() {
    return (
      <div className="inventory_wrapper">
        <LoadingComponent loading={this.state.loading || this.props.loading === true} />
        <form action="#" onSubmit={(e) => {this.onFilter(e, this);}} className="inventory_input">
          <input ref={this.searchInput} type="text" className="text_input" onChange={(e) => this.onFilter(e, this)} />
          <input type="submit" hidden />
          <Select
            className="inventory_select"
            onChange={(sel: any) => {this.sortMethod = sel.value; this.onFilter(undefined, this)}}
            options={this.options}
            defaultValue={this.options[0]}
            /* Doesnt work
            hasMore={this.state.hasMore}
             */
            theme={(theme: any) => ({
              ...theme,
              borderRadius: 5,
              colors: {
                ...theme.colors,
                /* Outline SelectHighlight */
                primary: '#d8d8d8',
                /* Background */
                neutral0: '#1E1E1E',
                /* Text */
                neutral80: '#d8d8d8',
                /* Highlight */
                primary25: '#252525',
                /* ClickHighlight */
                primary50: 'gray',
                /* Border */
                neutral20: '#9d9d9d',
              },
            })}
          />
        </form>
        <div
          className="card_wrapper"
        >
          <ScrollbarComponent>
            <InfiniteScroll
              pageStart={0}
              loadMore={this.trackScrolling}
              hasMore={true}
              className="card_wrapper"
              useWindow={false}
            >
              {
                this.state.errorMessage === undefined ? this.state.cards.map((card) => (
                  < div className="inventory_card_wrapper" key={"card-" + card.id}>
                    <GameCardComponent
                      onClick={(e: any, card: any) => { if(this.onCardClick){ this.onCardClick(e, card); } }}
                      card={card}
                      size="1"
                      cardcolor="transparent"
                      clickable="true"
                      redirects={this.redirect}
                    />
                  </div>
                )) :
                  (
                    <h1> {this.state.errorMessage} </h1>
                  )
              }
            </InfiniteScroll>
          </ScrollbarComponent>
        </div>
      </div>
    );
  }
}

export default withAxiosPrivate(withAuth(withRouter(InventoryComponent)));
