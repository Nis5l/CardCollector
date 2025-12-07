import { LoadingComponentState } from "../../../../shared/abstract/loading-component";
import { Achievement } from "../../../../shared/components/achievements/achievement";
import { Collector } from "../../../../shared/types";

export interface UserDashboardState extends LoadingComponentState {
	friendListState: "friend" | "friendRequests",
	friendRequestCount?: number,
	maxFriends?: number,
	friends?: number,

	colelctorFavorites?: Collector[],
	achievements?: Achievement[],
}
