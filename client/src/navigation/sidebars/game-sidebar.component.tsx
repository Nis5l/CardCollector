import { NavigationLinkItem, NavigationSubMenuItem, NavigationMenuItem } from "../navigation-items";
import SidebarComponent from "../sidebar.component";

export default function GameSidebarComponent(){
    const gameNavbar: NavigationMenuItem[] = [
        new NavigationSubMenuItem("Dashboard", [
          new NavigationLinkItem("Home", "dashboard"),
          new NavigationLinkItem("Pack", "pack"),
          new NavigationLinkItem("Inventory", "inventory")
        ], <i className="fas fa-home"></i>)
    ];

    return (
        <SidebarComponent
            menuItems={gameNavbar}
        />
    )
}
