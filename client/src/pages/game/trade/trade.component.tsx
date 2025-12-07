import React, { RefObject } from 'react'
import moment from 'moment';
import type { AxiosError } from 'axios';

import { AbstractComponent } from '../../../shared/abstract'
import { CardComponent } from '../../../shared/components'
import { ScrollbarComponent, LoadingComponent, YesNoComponent, YesNoCancelComponent, GameCardLoadComponent, GameCardComponent } from '../../../shared/components'
import { redirectIfNecessary } from '../../../api'
import { parseCards, formatTime } from '../../../utils';
import { withRouter, withAuth, withAxiosPrivate } from '../../../hooks'
import type { TradeState, TradeProps } from './types';

import './trade.component.scss'

const suggestCardColor = "rgb(255 255 255 / 50%)";

class TradeComponent extends AbstractComponent<TradeProps, TradeState> {
  private lCounter: number;
  private lCounterMax: number;

  private friendid: string | undefined;

  private tradeCount1: number = 0;
  private tradeLimit: number = 0;

  private cardfriend: RefObject<any>;

  private timeinterval: NodeJS.Timeout | undefined;

  constructor(props: TradeProps) {
    super(props);

    this.lCounter = 0;
    this.lCounterMax = 1;

    this.state =
    {
      name: "Loading...",
      cards: [],
      friendcards: [],
      found: true,
      info: "",
      friendinfo: "",
      tradeCount: 0,
      friendTradeCount: 0,
      tradeLimit: 0,
      tradeTime: 0,
      cardSuggestions: [],
      friendCardSuggestions: [],
      confirmed: 0,
      friendConfirmed: 0,

      removeId: undefined,
      removeFriendSuggestionId: undefined,
      removeSuggestionId: undefined,

      disabled: undefined,
      confirmdisabled: undefined,

      loading: true
    }

    this.friendid = props.router.params.id;
    this.cardfriend = React.createRef();
  }

  componentDidMount() {
    this.load();
  }

  componentWillReceiveProps(props: TradeProps) {
    if(this.friendid === props.router.params.id) return;

    this.friendid = props.router.params.id;

    this.setState({
      name: "Loading...",
      cards: [],
      friendcards: [],
      found: true,
      info: "",
      friendinfo: "",
      tradeCount: 0,
      friendTradeCount: 0,
      tradeLimit: 0,
      cardSuggestions: [],
      friendCardSuggestions: [],
      confirmed: 0,
      friendConfirmed: 0,

      removeId: undefined,
      removeFriendSuggestionId: undefined,
      removeSuggestionId: undefined,

      disabled: undefined,
      confirmdisabled: undefined
  });

    this.load();
  }

  load() {
    this.props.axios.get(`/trade/${this.friendid}`)
      .then((res: any) => {
        this.incrementLCounter();
          parseCards(res.data.selfCards);
          parseCards(res.data.friendCards);
          parseCards(res.data.selfCardSuggestions);
          parseCards(res.data.friendCardSuggestions);

          this.tradeCount1 = res.data.tradeCount1;
          this.tradeLimit = res.data.tradeLimit;

          this.setState({
            name: res.data.friendUsername,
            cards: res.data.selfCards,
            friendcards: res.data.friendCards,
            tradeCount: res.data.selfCards.length,
            friendTradeCount: res.data.friendCards.length,
            tradeLimit: res.data.tradeCardLimit,
            cardSuggestions: res.data.friendCardSuggestions,
            friendCardSuggestions: res.data.selfCardSuggestions,
            confirmed: res.data.selfStatus,
            friendConfirmed: res.data.friendStatus,
			      tradeTime: 0
          }, () => {this.setInfo(); this.setDisabled()});

          if (res.data.tradeTime != null) {
			      res.data.tradeTime = moment(res.data.tradeTime).toDate();
            let interval = this.timeinterval = setInterval(() => {
              let diff = moment(res.data.tradeTime).diff(moment());
              if(diff < 0) diff = 0;
              this.setState({tradeTime: diff}, this.setDisabled)
              if (diff === 0) clearInterval(interval);
            }, 1000)
          }
      }).catch((err: AxiosError) => {
          if (redirectIfNecessary(this.props.router.navigate, err)) return;
          this.setState({found: false});
	  });
  }

  componentWillUnmount() {
    if (this.timeinterval) clearInterval(this.timeinterval);
  }

  setInfo() {
    this.setState({
      info: this.state.tradeCount + "/" + this.state.tradeLimit + (this.state.confirmed === 1 ? " ✔" : " 🗙"),
      friendinfo: this.state.friendTradeCount + "/" + this.state.tradeLimit + (this.state.friendConfirmed === 1 ? " ✔" : " 🗙"),
    });
  }

  incrementLCounter() {
    this.lCounter++;
    if (this.lCounter === this.lCounterMax) this.setState({loading: false});
  }

  setDisabled() {
    if (this.state.tradeCount >= this.state.tradeLimit)
      this.setState({disabled: "Cardlimit Reached"});
    else
      this.setState({disabled: undefined});

    if (this.state.confirmed === 1)
      this.setState({confirmdisabled: "Already Confirmed"})

    if (this.state.tradeTime !== 0)
      this.setState({confirmdisabled: formatTime(this.state.tradeTime)})
  }

  onCardOwnClick(e: any, uuid : any, self: TradeComponent) {
    self.setState({removeId: uuid});
  }

  onFriendCardSuggestionClick(e: any, uuid: any, self: TradeComponent) {
    self.setState({removeFriendSuggestionId: uuid});
  }

  onCardSuggestionClick(e: any, uuid: any, self: TradeComponent) {
    self.setState({removeSuggestionId: uuid});
  }

  cardOwnRemove = () => {

    for (let i = 0; i < this.state.cards.length; i++) {
      if (this.state.cards[i].id === this.state.removeId) {
        this.state.cards.splice(i, 1);
        break;
      }
    }

    this.props.axios.post(`/trade/${this.friendid}/card/remove/${this.state.removeId}`, {})
      .then((res: any) => {
        this.load()
      });

    this.setState({removeId: undefined, tradeCount: this.state.tradeCount - 1, confirmed: 0, friendConfirmed: 0},
      () => {this.setInfo(); this.setDisabled()});
  }

  cardOwnRemoveCancel = () => {
    this.setState({removeId: undefined});
  }

  cardSuggestionFriendCancel = () => {
    this.setState({removeFriendSuggestionId: undefined});
  }

  cardSuggestionFriendRemove = () => {

    for (let i = 0; i < this.state.friendCardSuggestions.length; i++) {
      if (this.state.friendCardSuggestions[i].id === this.state.removeFriendSuggestionId) {
        this.state.friendCardSuggestions.splice(i, 1);
        break;
      }
    }

    this.props.axios.post(`/trade/${this.friendid}/suggestion/remove/${this.state.removeFriendSuggestionId}`, {})
      .then((res: any) => {
        this.load()
      }).catch((err: AxiosError) => {
        if (redirectIfNecessary(this.props.router.navigate, err)) return;
	  });

    this.setState({removeFriendSuggestionId: undefined});
  }

  cardSuggestionCancel = () => {
    this.setState({removeSuggestionId: undefined});
  }

  cardSuggestionYes = () => {

    for (let i = 0; i < this.state.cardSuggestions.length; i++) {
      if (this.state.cardSuggestions[i].id === this.state.removeSuggestionId) {
        this.state.cards.splice(0, 0, this.state.cardSuggestions[i]);
        this.state.cardSuggestions.splice(i, 1);
        break;
      }
    }

    this.props.axios.post(`/trade/${this.friendid}/card/add/${this.state.removeSuggestionId}`, {})
      .then((res: any) => {
        this.load()
      }).catch((err: any) => {
        redirectIfNecessary(this.props.router.navigate, err);
	  });

    this.setState({removeSuggestionId: undefined, tradeCount: this.state.tradeCount + 1},
      () => {this.setInfo(); this.setDisabled()});
  }

  cardSuggestionNo = () => {

    for (let i = 0; i < this.state.cardSuggestions.length; i++) {
      if (this.state.cardSuggestions[i].id === this.state.removeSuggestionId) {
        this.state.cardSuggestions.splice(i, 1);
        break;
      }
    }

    this.props.axios.post(`/trade/${this.friendid}/suggestion/remove/${this.state.removeSuggestionId}`, {})
      .then((res: any) => {
        this.load()
      }).catch((err: any) => {
        redirectIfNecessary(this.props.router.navigate, err);
	  });

    this.setState({removeSuggestionId: undefined});
  }

  confirm = () => {

    this.setState({confirmed: 1}, this.setInfo);

    this.props.axios.post(`/trade/${this.friendid}/confirm`, {})
      .then((res: any) => {
        this.load();
      }).catch((err: any) => {
    	redirectIfNecessary(this.props.router.navigate, err);
	  });
  }

  redirect = (url: string) => {
    this.props.router.navigate(url);
  }

  render() {

    let size = 0.8;
    if (window.screen.availWidth < 600) size = 0.7;
    if (window.screen.availWidth < 500) size = 0.6;
    if (window.screen.availWidth < 420) size = 0.5;
    if (window.screen.availWidth < 350) size = 0.4;

    return (
      <div className="trade_wrapper_parent">
        <LoadingComponent loading={this.state.loading} />
        {
          this.state.removeSuggestionId !== undefined &&
          <YesNoCancelComponent
            disableYes={this.state.tradeCount >= this.state.tradeLimit}
            yesCallback={this.cardSuggestionYes}
            noCallback={this.cardSuggestionNo}
            cancelCallback={this.cardSuggestionCancel}
            text="Accept?"
          />
        }
        {
          this.state.removeFriendSuggestionId !== undefined &&
          <YesNoComponent
            yesCallback={this.cardSuggestionFriendRemove}
            noCallback={this.cardSuggestionFriendCancel}
            text="Remove?"
          />
        }
        {
          this.state.removeId !== undefined &&
          <YesNoComponent
            yesCallback={this.cardOwnRemove}
            noCallback={this.cardOwnRemoveCancel}
            text="Remove?"
          />
        }
        {
          this.state.found ? (
            <div className="trade_wrapper">
              <CardComponent
                styleClassName="trade_own"
                title={"You " + this.state.info}
                icon={''}
                iconNum={0}
                onIconClick={function (): void {} }
                onClick={function (event: any): void {} }
              >
                <ScrollbarComponent>
                  <div className="card_wrapper">
                    {
                      this.state.cardSuggestions !== undefined &&
                      (
                        this.state.cardSuggestions.map((card: any) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <GameCardComponent
                              card={card}
                              size={size}
                              onClick={(e: any, uuid: any) => {this.onCardSuggestionClick(e, uuid, this)}}
                              cardcolor={suggestCardColor}
                            >
                            </GameCardComponent>
                          </div>
                        ))
                      )
                    }
                    {
                      this.state.cards === undefined ?
                        (
                          <div className="cards_load">
                            <GameCardLoadComponent size={1}/>
                          </div>
                        ) :
                        this.state.cards.map((card: any) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <GameCardComponent
                              card={card}
                              size={size}
                              onClick={(e: any, uuid: any) => {this.onCardOwnClick(e, uuid, this)}}
                            >
                            </GameCardComponent>
                          </div>
                        )
                        )
                    }
                  </div>
                </ScrollbarComponent>
                <input
                  type="submit"
                  className="button_input"
                  value={this.state.disabled !== undefined ? this.state.disabled : "Add Card"}
                  disabled={this.state.disabled !== undefined}
                  onClick={() => {this.redirect("/tradeinventory/" + this.friendid)}}
                />
              </CardComponent>
              <CardComponent
                styleClassName="trade_friend"
                title={this.state.name + " " + this.state.friendinfo}
                icon={''}
                iconNum={0}
                onIconClick={function (): void {} }
                onClick={function (event: any): void {} }
              >
                <ScrollbarComponent>
                  <div className="card_wrapper">
                    {
                      this.state.friendCardSuggestions !== undefined &&
                      (
                        this.state.friendCardSuggestions.map((card: any) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <GameCardComponent
                              card={card}
                              size={size}
                              onClick={(e: any, uuid: any) => {this.onFriendCardSuggestionClick(e, uuid, this)}}
                              cardcolor={suggestCardColor}
                            >
                            </GameCardComponent>
                          </div>
                        ))
                      )
                    }
                    {
                      this.state.friendcards === undefined ?
                        (
                          <div className="cards_load">
                            <GameCardLoadComponent size={1}/>
                          </div>
                        ) :
                        this.state.friendcards.map((card: any) => (
                          <div className="waifucard_wrapper" key={"card-" + card.id}>
                            <GameCardComponent
                              card={card}
                              size={size}
                            >
                            </GameCardComponent>
                          </div>
                        )
                        )
                    }
                  </div>
                </ScrollbarComponent>
                <input
                  type="submit"
                  className="button_input"
                  value="Suggest Card"
                  onClick={() => {this.redirect("/suggestcard/" + this.friendid)}}
                />
              </CardComponent>
              <input
                type="submit"
                className="button_input button_confirm"
                value={this.state.confirmdisabled == null ? "Confirm" : this.state.confirmdisabled}
                onClick={this.confirm}
                disabled={this.state.confirmdisabled !== undefined}
              />
            </div>
          ) :
            (
              <div className="trade_wrapper">
                <CardComponent
                  styleClassName="trade_own trade_friend"
                  title="Error"
                  icon={''}
                  iconNum={0}
                  onIconClick={function (): void {} }
                  onClick={function (event: any): void {} }
                >
                  <h1>User not found</h1>
                </CardComponent>
              </div>
            )
        }
      </div >
    );
  }
}

export default withAuth(withAxiosPrivate(withRouter(TradeComponent)));
