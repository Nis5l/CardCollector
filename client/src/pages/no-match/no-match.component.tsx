import { AbstractComponent } from '../../shared/abstract'
import { CardComponent } from '../../shared/components'

import './no-match.component.scss'

class NoMatchComponent extends AbstractComponent {
  render() {
    return (
      <div className="nopage_wrapper">
        <CardComponent
          title={''}
          styleClassName={''}
          icon={''}
          iconNum={0}
        >
        (⌯˃̶᷄ ﹏ ˂̶᷄⌯)ﾟ <br/> <br/> This page doesn't exist
        </CardComponent>
      </div>
    )
  }
}

export default NoMatchComponent;
