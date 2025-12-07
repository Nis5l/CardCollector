
import Config from "../../../config.json";

import "./profile-image.component.scss"
import { PropsProfileImageProps } from './types';

export default function ProfileImageComponent(props: PropsProfileImageProps){
    return (
        <div className={"profile_image " + (props.className != null ? props.className : "")}>
            <img
                src={`${Config.API_HOST}/user/${props.userId}/avatar`}
                alt="Avatar"
            />
        </div>
    )
}
