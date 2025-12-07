import { CollectorProps } from './types';

import "./collector.component.scss";

function CollectorComponent(props: CollectorProps){
    const onClick = () => {
        if(props.onClick != null) props.onClick(props.collector);
    }

    return (
        <div
            onClick={onClick}
            className="collector-card-wrapper zoom"
        >  
            <div className="collector-card-image">
                <img src="/assets/placeholder.png" alt="Collector" />
            </div>
            <div className="collector-card-content">
                <h2>{props.collector.name}</h2>
            </div>
        </div>
    )
}

export default CollectorComponent;
