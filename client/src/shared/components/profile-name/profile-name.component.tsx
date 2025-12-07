import axios from 'axios'

import Config from '../../../config.json'
import "./profile-name.component.scss"
import type { ProfileNameProps, ProfileNameState } from './types';
import BadgeComponent, { type Badge } from './badge';
import { random_string } from '../../../utils';
import { AbstractLoadingComponent } from '../../abstract';

export default class ProfileNameComponent extends AbstractLoadingComponent<ProfileNameProps, ProfileNameState> {
	protected readonly renderLoad = false;
	protected readonly loadLimit = 2;

	constructor(props: ProfileNameProps) {
		super(props);

		this.state = {
			loading: true,
		};
	}

	public componentDidMount() {
		this.loadUsername();
		this.loadBadges();
	}

	public async componentDidUpdate() {
	}

	public override render() {
		return (
			<div className="profileName">
				<a href={`/profile/${this.props.userId}`} className="name">{this.state.username}</a>
				<div className="badges">
					{
						this.state.badges?.map((badge) => {

							let badgeImage = Config.API_HOST + badge.asset;

							return (
								<BadgeComponent
									key={random_string(30)}
									img={badgeImage}
									name={badge.name}
								/>
							)
						})

					}
				</div>
			</div>
		);
	}

	private async loadUsername(): Promise<void> {
		if (this.props.username != null && this.props.username !== this.state.username) {
			this.setState({username: this.props.username});
			this.incrementLoadCount();
		} else {
			const data = (await axios.get(`${Config.API_HOST}/user/${this.props.userId}/username`)).data;
			this.setState({username: data.username});
			this.incrementLoadCount();
		}
	}

	private async loadBadges(): Promise<void> {
		const badges: Badge[] = this.props.badges ? this.props.badges : (await axios.get(Config.API_HOST + `/user/${this.props.userId}/badges`).catch(() => ({data: {badges: [] }}))).data.badges;
		this.setState({badges});
        this.incrementLoadCount();
	}
}
