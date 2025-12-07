import { ReactNode } from "react";

export interface NavigationMenuItem {
    text: string,
    icon?: ReactNode,
    build: () => ReactNode
}
