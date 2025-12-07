import { useEffect } from "react";
import { useRefreshToken } from "../hooks";

type PropsRememberMe = {
    remembered: () => void
}

function RememberMe(props: PropsRememberMe){
    const refresh  = useRefreshToken();

    useEffect(() => {
        refresh().then(() => props.remembered());       
    }, [refresh, props]);
    
    return (
        <>
        </>
    )
}

export default RememberMe;
