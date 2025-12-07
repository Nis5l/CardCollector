import { NavigationMenuItem, NavigationLinkItem } from "../navigation-items";
import SidebarComponent from "../sidebar.component";

export default function CollectorSidebarComponent(){
    const gameNavbar: NavigationMenuItem[] = [
        new NavigationLinkItem("List", "/collectors"),
    ];

    return (
        <SidebarComponent
            menuItems={gameNavbar}
        />
    )
}
