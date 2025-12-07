import CollapsibleContent from 'react-collapsible-content'

import ResizeTextComponent from '../resize-text'
import { AbstractComponent } from '../../abstract';
import { FoldableProps, FoldableState } from './types';
import "./foldable.component.scss"
import "../../../scss/effects.scss"

export default class FoldableComponent extends AbstractComponent<FoldableProps, FoldableState> {
    constructor(props: FoldableProps) {
        super(props);
        this.state = {
            expanded: false
        }
    }

    onOpen() {
        this.setState({expanded: !this.state.expanded});
    }

    render() {
        return (
            <div onClick={() => {this.onOpen()}} className={`card fold-card ${this.props.styleClassName}`}>
                <div className="card-title"><ResizeTextComponent center={false} maxSize={0}><h1 className="shake-small">{this.props.title}</h1></ResizeTextComponent></div>
                <CollapsibleContent expanded={this.state.expanded} className="card-content">
                    {this.props.children}
                </CollapsibleContent>
            </div >
        );
    }
}
