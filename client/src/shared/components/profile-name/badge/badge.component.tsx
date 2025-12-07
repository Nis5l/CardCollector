import {Tooltip} from 'reactstrap'
import {useState} from 'react'

import type { BadgeProps } from './types';
import { random_string } from '../../../../utils';

export default function BadgeComponent(props: BadgeProps) {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);

    const [badgeID] = useState(random_string(30));

    return (
        <div className="badge">
            <img src={props.img} alt={props.name} id={badgeID} />
            <Tooltip placement="bottom" isOpen={tooltipOpen} target={badgeID} toggle={toggle}>
                {props.name}
            </Tooltip>
        </div>
    );
}
