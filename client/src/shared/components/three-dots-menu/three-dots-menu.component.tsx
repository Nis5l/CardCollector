import React from 'react'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import type { ThreeDotsMenuProps } from './types';

import './three-dots-menu.component.scss'

export default function ThreeDotsMenuComponent(props: ThreeDotsMenuProps) {

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    return (
        <div className="threeDotsMenu">

            <Button aria-controls={props.menuID} aria-haspopup="true" onClick={handleClick}>
                <MoreVertIcon />
            </Button>
            <Menu
                id={props.menuID}
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >

                {props.options && props.options.map((option: any, i: number) => {

                    return (
                        <MenuItem
                            style={{color: option.color}}
                            onClick={() => {handleClose(); option.onClick()}}
                            key={i}
                        >
                            {option.name}
                        </MenuItem>
                    );

                })}

            </Menu>

        </div>
    )
}
