import { SubMenu } from "react-pro-sidebar";
import { ReactNode } from "react";

import { NavigationMenuItem } from './navigation-menu-item';
import { random_string } from '../../utils';

export class NavigationSubMenuItem implements NavigationMenuItem {
    private id: string = random_string(20);

    constructor(
        public text: string,
        public items: NavigationMenuItem[],
        public icon?: ReactNode
    ){}

    build(): ReactNode{
        const items: ReactNode[] = this.items.map((item: NavigationMenuItem) => item.build() );

        return (
            <SubMenu
                key={this.id}

                title={this.text}
                icon={this.icon}
            >
                { items }
            </SubMenu>
        )
    }
}
