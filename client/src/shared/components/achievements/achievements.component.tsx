import { AbstractComponent } from '../../../shared/abstract'
import AchievementComponent, { type Achievement } from './achievement';
import type { AchievementsProps } from './types';
import { ScrollbarComponent } from '../../../shared/components'

import './achievements.component.scss';

export default class AchievementsComponent extends AbstractComponent<AchievementsProps>{
	render()
	{
		this.props.achievements.reverse();
		return (
			<ScrollbarComponent>
				<ul className='achievements-inner'>
					{
						this.props.achievements.map((achievement: Achievement) => (
							<AchievementComponent key={achievement.text} achievement={achievement}/>
						))
					}
				</ul>
			</ScrollbarComponent>
		);
	}
}
