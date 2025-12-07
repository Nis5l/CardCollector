import { AbstractComponent } from '../../../shared/abstract';
import {Scrollbars} from 'react-custom-scrollbars'

import './scrollbar.component.scss'

export default class ScrollbarComponent extends AbstractComponent {
    constructor(props: any) {
        super(props);
        this.renderThumb = this.renderThumb.bind(this);
    }

    renderThumb(style: any, props: any) {
        const thumbStyle = {
            backgroundColor: `rgba(${140}, ${140}, ${140}, ${0.2})`,
            borderRadius: "15px"
        };
        return (
            <div
                style={{...style, ...thumbStyle}}
                {...props} />
        );
    }

    renderView(props: any) {
        return (
            <div {...props} className="scroll_view" />
        )
    }

    render() {
        return (
            <Scrollbars
                className="scrollbar"
                renderThumbHorizontal={this.renderThumb}
                renderThumbVertical={this.renderThumb}
                renderView={this.renderView}
                {...this.props} />
        );
    }
}
