import React from 'react';
import { AbstractComponent } from '../../../abstract';
import CardComponent from '../../card'
import type { YesNoProps } from './types';

import '../popup.component.scss';

export default class YesNoComponent extends AbstractComponent<YesNoProps> {
    private text: string;

    private yesCallback: () => void;
    private noCallback: () => void;

    constructor(props: YesNoProps) {
        super(props);

        this.yesCallback = props.yesCallback;
        this.noCallback = props.noCallback;
        this.text = props.text;
    }

    yesClick = () => {
        if (this.yesCallback !== undefined) this.yesCallback();
    }

    noClick = () => {
        if (this.noCallback !== undefined) this.noCallback();
    }

    render() {
        return (
            <div className="popup_wrapper">
                <div className="blurbackground" />
                <CardComponent 
                    styleClassName="popup"
                    title="" icon=""
                    iconNum={0}
                    onIconClick={function (): void {} } 
                    onClick={function (event: React.MouseEvent): void {}}>
                    <div className="popup_content">
                        <div className="text_area">
                            <p>{this.text}</p>
                        </div>
                        <div className="input_area">
                            <input type="button" onClick={this.yesClick} className="button_input" value="Yes" />
                            <input type="button" onClick={this.noClick} className="button_input" value="No" />
                        </div>
                    </div>
                </CardComponent>
            </div>
        )
    }
}
