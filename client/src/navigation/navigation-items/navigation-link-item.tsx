import { MenuItem } from "react-pro-sidebar";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { NavigationMenuItem } from './navigation-menu-item';
import { random_string } from '../../utils';

export class NavigationLinkItem implements NavigationMenuItem {
    private id: string = random_string(20);

    constructor(
        public text: string,
        public link: string,
        public icon?: ReactNode
    ){}

    build(): ReactNode{
        return (
            <MenuItem
                key={this.id}

                icon={this.icon}
            >
                <Link
                    to={this.link}
                >{this.text}</Link>
            </MenuItem>
        )
    }
}
