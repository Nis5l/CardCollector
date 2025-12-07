import ResizeTextComponent from "../resize-text"

import { AbstractComponent } from '../../abstract';
import { withRouter } from '../../../hooks'
import type { GameCardProps, GameCardState } from './types';
import { DEFFONT, DEFHEIGTH, DEFWIDTH } from './constants';

import './game-card.component.scss'

class GameCardComponent extends AbstractComponent<GameCardProps, GameCardState> {
	private upgradeEffectDelay = 100;
    private upgradeEffectTimer: NodeJS.Timer | undefined = undefined;
    private upgradeEffectSize = 1.2;
    private effectSymbols = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    constructor(props: GameCardProps) {
        super(props);

        this.init(props);
    }

    init(props: GameCardProps) {
        /*
         * WARNING INTENDED
         */
        if (this.state === undefined)
            this.state =
            {
                turned: props.turned,
				card: props.card,
                size: props.size,
                cardColor: props.cardColor,
                identifier: props.identifier,
                clickable: props.clickable,
                redirects: props.redirects,

                sizeMultiplier: 1,
                focus: false,
                upgradeEffect: undefined,
            };
        else
            this.setState({
                turned: props.turned,
				card: props.card,
                size: props.size,
                cardColor: props.cardColor,
                identifier: props.identifier,
                clickable: props.clickable,
                redirects: props.redirects,
            });
    }

    onTurn(e: React.MouseEvent) {
        if (this.props.onTurn !== undefined) this.props.onTurn(e, this.state.card.id);
        this.setState({turned: false});

        if (this.props.onClick !== undefined) this.props.onClick(e, this.state.card.id);

        if (this.state.redirects) this.redirect();
    }

    redirect() {
        this.props.router.navigate(`/card/${this.state.card.id}`)
    }

    componentDidMount() {
        if (this.props.onCreate) this.props.onCreate(/*this*/);
    }

    shouldComponentUpdate(nextProps: GameCardProps, nextState: GameCardState) {
        if (nextProps.card && nextProps.card.id !== undefined &&
            this.state !== undefined &&
            nextProps.card.id !== this.state.card.id) {
            this.init(nextProps);
            return true;
        }

        return nextState.turned !== this.state.turned ||
            nextState.card.level !== this.state.card.level ||
            nextState.card.quality !== this.state.card.quality ||
            nextState.card.id !== this.state.card.id ||
            nextState.clickable !== this.state.clickable ||
            nextState.focus !== this.state.focus ||
            nextState.sizeMultiplier !== this.state.sizeMultiplier ||
            nextState.cardColor !== this.state.cardColor ||
            nextState.upgradeEffect?.level !== this.state.upgradeEffect?.level ||
            nextState.upgradeEffect?.quality !== this.state.upgradeEffect?.quality ||
            nextState.redirects !== this.state.redirects;
    }

    startUpgradeEffect() {
        if (this.state.upgradeEffect !== undefined) return;

        this.setState({cardColor: "#ffffffff" });

        this.upgradeEffectTimer = setInterval(() => {
            const idx = Math.floor(Math.random() * (this.effectSymbols.length + 1));
            const idx2 = Math.floor(Math.random() * (this.effectSymbols.length + 1));
            this.setState({upgradeEffect: { level: this.effectSymbols[idx], quality: this.effectSymbols[idx2]}});
        }, this.upgradeEffectDelay)

    }

    focusCard() {
        this.setState({focus: true, sizeMultiplier: this.upgradeEffectSize});
    }

    unFocusCard() {
        this.setState({focus: false, sizeMultiplier: 1});
    }

    endUpgradeEffect() {
        this.setState({cardColor: "transparent", upgradeEffect: undefined});
        if (this.upgradeEffectTimer !== undefined) clearInterval(this.upgradeEffectTimer);
        this.upgradeEffectTimer = undefined;
    }

    componentWillUnmount() {
        if (this.upgradeEffectTimer !== undefined) clearInterval(this.upgradeEffectTimer);
    }

    setClickable(b: boolean) {
        if (b !== true && b !== false) b = true;
        this.setState({clickable: b});
    }

    render() {
        return (
            < div
                className={this.state.focus ? "waifucard waifucard_upgrade" : "waifucard"}
                onClick={(e) => {this.onTurn(e)}
                }
                style={{
                    cursor: `${this.state.clickable === true ? "pointer" : "default"}`,
                    width: `${DEFWIDTH * this.state.size * this.state.sizeMultiplier}px`,
                    height: `${DEFHEIGTH * this.state.size * this.state.sizeMultiplier}px`,
                    zIndex: `${this.state.focus ? "1011" : "unset"}`
                }}
            >
                <div
                    className="waifucard-inner"
                    style={{
                        backgroundImage: `url(${this.state.card.cardInfo.image})`,
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`
                    }}
                />
                <div
                    className="waifucard-effect"
                    style={{
                        backgroundImage: `url(${this.state.card.cardEffect.image})`,
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        opacity: `${this.state.card.cardEffect.opacity}`,
                        animation: `${this.state.focus ? "bigpulseinputshadow 4s ease-out infinite" : "unset"}`
                    }}
                />
                <div
                    className="waifucard-color"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        backgroundColor: `${this.state.cardColor}`,
                        transition: `${this.state.upgradeEffect != null
                            ? "background-color linear 2.3s" :
                            "background-color linear 0.5s"}`
                    }}
                />
                <div
                    className="waifucard-framefront"
                    style={{
                        backgroundImage: `url(${this.state.card.cardFrame.front})`,
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`
                    }}
                />
                <div
                    className="waifucard-frameback"
                    style={{
                        backgroundImage: `url(${this.state.card.cardFrame.back})`,
                        transform: `rotateY(${this.state.turned ? 0 : 180}deg)`
                    }}
                />
                <div
                    className="waifucard-name"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                    }}
                >
                    <ResizeTextComponent center={true}>
                        {this.state.card.cardInfo.name}
                    </ResizeTextComponent>
                </div>
                <div
                    className="waifucard-anime"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                    }}
                >
                    <ResizeTextComponent center={true}>
                        {this.state.card.cardType.name}
                    </ResizeTextComponent>
                </div>
                <div
                    className="waifucard-quality"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        fontSize: `${DEFFONT * this.state.size * this.state.sizeMultiplier}px`
                    }}
                >
                    {this.state.upgradeEffect != null ? this.state.upgradeEffect.quality : this.state.card.quality}
                </div>
                <div
                    className="waifucard-level"
                    style={{
                        transform: `rotateY(${this.state.turned ? 180 : 0}deg)`,
                        fontSize: `${DEFFONT * this.state.size * this.state.sizeMultiplier}px`
                    }}
                >
                    {this.state.upgradeEffect != null ? this.state.upgradeEffect.level : this.state.card.level}
                </div>
            </div >
        );
    }
}

export default withRouter(GameCardComponent);
