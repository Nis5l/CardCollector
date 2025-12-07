import ResizeTextComponent from '../resize-text'

import { CardProps } from './types';
import "./card.component.scss"

export default function CardComponent(props: CardProps) {
    return (
        <div
            className={"card " + props.styleClassName}
            onClick={(e) => {if (props.onClick) props.onClick(e)}}
        >
            {
                props.title &&
                <div
                    className="card-title"
                >
                    <ResizeTextComponent
                        center={false}
                        maxSize={0}
                    >
                        <h1>
                            {props.title}
                        </h1>
                    </ResizeTextComponent>
                    {
                        props.icon &&
                        <div onClick={props.onIconClick} className="icon">
                            <i style={{width: props.iconNum ? "30px" : "auto"}} className={"fas " + props.icon + " unselectable"} />
                            {
                                props.iconNum !== undefined && props.iconNum !== 0 &&
                                <div><p className="unselectable">{props.iconNum}</p></div>
                            }
                        </div>
                    }
                </div>
            }
            <div className="card-content" style={{height: !props.title ? "100%" : ""}}>
                {props.children}
            </div>
        </div>
    );
}
