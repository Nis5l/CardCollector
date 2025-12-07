import {lazy, Suspense, useState} from 'react'

import { ScrollbarComponent, CardComponent, FoldableComponent, LoadingComponent } from '../../shared/components'
import PackGraphComponent from './pack-graph'

import "./home.component.scss"
import "../../scss/effects.scss"
import { Link } from 'react-router-dom'

const GameCardComponent = lazy(() => import('../../shared/components/game-card'));
//TODO: loading
const loading = () => <p>Loading...</p>

export default function HomeComponent() {

    const [loadingState, setLoadingState] = useState(true);

    return (

        <ScrollbarComponent>
            <LoadingComponent loading={loadingState} />
            <div className="container_home">
                <CardComponent
                    title="Packs Opened"
                    styleClassName="packGraphWrapper"
                    icon={''}
                    iconNum={0}
                >
                    <PackGraphComponent styleClassName="packGraph" onLoad={() => {setLoadingState(false)}} />
                </CardComponent>

                <FoldableComponent
                    title="Tutorial"
                    styleClassName="tutorial"
                >
                    <h5>Packs</h5>
                    <p>In this game you can collect, upgrade and trade Waifu-Cards.</p>
                    <p>Every 30 minutes you can pull a Waifu-Card.</p>
                    <p>Waifu-Cards starts with Level 1 and a Quality from 1-5.</p>
                    <p>X: Level, Y: Quality</p>
                    <div>
                        <Suspense fallback={loading()}>
                            <GameCardComponent
								card={{
									id: 0,
									userId: "x",
									level: 1,
									quality: 2,
									cardInfo: {
										id: "x",
										name: "Ichigo",
										image: "/assets/card/Card_Ichigo.webp",
									},
									cardFrame: {
										id: "x",
										name: "frame",
										front: "/assets/card/Frame_Silver_Front.png",
										back: "/assets/card/Frame_Silver_Back.png",
									},
									cardType: {
										id: "x",
										name: "Darling In The FranXX",
									},
									cardEffect: {
										id: "x",
										image: "/assets/card/Effect2.gif",
										opacity: 0.5,
									},
								}}
                                size={0.8}
                                cardcolor="transparent"
                                clickable={false}
                            />
                        </Suspense>
                    </div>
                    <h5>Upgrading</h5>
                    <p>By Combining 2 Cards of the same Character and Level you can Upgrade them.</p>
                    <p>The Chance for the Upgrade to succeede in %:<br />(Quality1 + Quality2) * 10.</p>
                    <p>If the Upgrade succeedes:<br />
                    &emsp;Level will incremented by one.<br />
                    &emsp;Quality will be random from 1-5.
                </p>
                    <p>If the Upgrade fails:<br />
                    &emsp;Level will stay the same<br />
                    &emsp;Quality will be the avarage of the two plus 1.
                </p>

                    <h5>Trading</h5>
                    <p>You can trade with your friends.<br />
                    You can add and suggest Waifu-Cards when trading.<br />
                    When both Users hit accept the Trade is complete.</p>
                </FoldableComponent>
                <FoldableComponent
                    title="Copyright"
                    styleClassName="copyright"
                >
                    <p style={{paddingTop: "10px"}}>If you have any copyright related issues please contact me.<br />
                    (contact.waifucollector@gmail.com).</p>
                    <p>I will happily resolve the issue.</p>
                    <p>Everything is nonprofit, so I would be thankful if we could solve the problems without any sort of legal process.</p>
                </FoldableComponent>
                <div className="privacy_wrapper">
                    <CardComponent
                        styleClassName="privacy"
                        title={''}
                        icon={''}
                        iconNum={0}
                    >
                        <div>
                            <div>
								<a
									href="https://discord.gg/hftNUqNgRj"
									target="_blank"
									rel="noreferrer"
								>
									<img className="shake" src="/assets/discordicon.png" alt="Discord" />
								</a>
							</div>
                            <div>
								<a
									href="https://github.com/Nis5l/WaifuCollector"
									target="_blank"
									rel="noreferrer"
								>
									<img className="shake" src="/assets/giticon.png" alt="Discord" />
								</a>
							</div>
                            <div id="privacyhref">
								<Link to="/privacy" className="shake">Privacy</Link>
							</div>
                        </div>
                    </CardComponent>
                </div>
            </div >
        </ScrollbarComponent>
    )
}
