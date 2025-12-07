import FitText from '@plutonium-js/react-fit-text'

import { AbstractComponent } from '../../../shared/abstract';
import { ResizeTextProps } from './types';
import "./resize-text.component.scss"

export default class ResizeTextComponent extends AbstractComponent<ResizeTextProps> {
    render() {
        return (
            <div className="resizetext_wrapper">
                <FitText
                    className="resizetext"
                    style={{justifyContent: this.props.center === true ? "center" : "flex-start"}}
                    maxSize={this.props.maxSize}
                >
                    {this.props.children}
                </FitText>
            </div >
        );
    }
}
