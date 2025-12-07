import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { AbstractComponent } from "../shared/abstract";
import { withAuth } from "../hooks";
import { ProfileImageComponent } from "../shared/components";
import { NavigationProps } from './types';
import "./navigation.component.scss"

const navprefix: string = "nav-";

class NavigationComponent extends AbstractComponent<NavigationProps>{

    render(): ReactNode {
        return (
            <div className={navprefix + "wrapper"}>
                <div
                    className={navprefix + "title"}
                >
                    <Link
                        to="/"
                    >
                        <img
                            src="/assets/IconWhite.png"
                            className="headerIcon"
                            alt="Icon"
                        />

                        <span>WaifuCollector</span>
                    </Link>
                </div>
                <div className="gap"></div>
                <div className={navprefix + "links"}>
                    { this.props.auth != null && (
                        <>
                            <Link
                                to="/collector"
                            >Collectors</Link>
                            <ProfileImageComponent
                                className={"profile"}
                                userId={this.props.auth.id}
                            />
                            <Link
                                to="/logout"
                            >Logout</Link>
                        </>
                    ) }
                    { this.props.auth == null && (
                        <>
                            <Link
                                to="/register"
                            >Register</Link>
							<Link
								to="/login"
								className={navprefix + "login"}
							>
								Login
							</Link>
                        </>
                    ) }
                </div>
            </div>
        )
    }
}

export default withAuth(NavigationComponent);
