import { AbstractComponent } from '../../../shared/abstract'
import { redirectIfNecessary } from '../../../api'
import { LoadingComponent, GameCardLoadComponent, GameCardComponent } from '../../../shared/components'
import { withAxiosPrivate, withRouter } from '../../../hooks'
import { parseCards } from '../../../utils';
import type { PackProps, PackState } from './types';

import './pack.component.scss'

class PackComponent extends AbstractComponent<PackProps, PackState> {
    private key: number;
    private quitCooldown: number;
    private quittable: boolean;
	private collectorId: string;

    constructor(props: PackProps) {
        super(props);
        this.key = 0;
        this.quitCooldown = 800;
        this.quittable = false;

        this.collectorId = this.props.router.params.collector_id != null ? this.props.router.params.collector_id : "";

        this.state =
        {
            cards: [],
            loading: true
        }
    }

    componentDidMount() {
        this.props.axios.post(`${this.collectorId}/pack/open`, {})
            .then((res: any) => {
                this.setState({loading: false});

				let cards = res.data.cards;
				parseCards(cards);
				this.setState({cards: cards});
            }).catch((err: any) => {
                if(redirectIfNecessary(this.props.router.navigate, err)) return;
				this.props.router.navigate('/dashboard');
			});
    }

    startQuitCooldown(e: any, uuid: any, self: PackComponent) {
        if (!self.quittable) {
            setTimeout(() => {
                self.quittable = true;
            }, self.quitCooldown);
        }
        else {
            self.props.router.navigate(`/card/${uuid}`);
            e.stopPropagation();
            e.preventDefault();
        }
    }

    onQuit(e: any, self: PackComponent) {
        if (!self.quittable) return;
        self.props.router.navigate('/dashboard');
        e.preventDefault();
    }

    render() {
        return (
            <div onClick={(e) => {this.onQuit(e, this)}} className="container_pack" >
                <LoadingComponent loading={this.state.loading} />

                <div className="packtop-wrapper">
                    <div className="packtop" />
                    <div className="packtopshadow" />
                </div>
                <div className="packbottom-wrapper">
                    <div className="packbottomshadow" />
                    <div className="packbottom" />
                </div>
                <div className="packleft-wrapper">
                    <div className="packleft" />
                    <div className="packleftshadow" />
                </div>
                <div className="packright-wrapper">
                    <div className="packright" />
                    <div className="packrightshadow" />
                </div>

                <div className="pack_card_container">
                    <div className="packtopleftcorner" />
                    <div className="packbottomrightcorner" />
                    {
                        this.state.cards.length > 0 ? this.state.cards.map((card) => (
                            <div className="packcard" key={this.key++}>
                                <GameCardComponent
                                    card={card}
                                    size="1"
                                    cardcolor="transparent"
                                    clickable="true"
                                    turned="true"
                                    onturn={this.startQuitCooldown}
                                    onturndata={this}
                                />
                            </div>
                        ))
                            :
                            (
                                <div className="pack_load">
                                    <GameCardLoadComponent size={1}/>
                                </div>
                            )
                    }
                </div>
            </div>
        );
    }
}

export default withAxiosPrivate(withRouter(PackComponent));
