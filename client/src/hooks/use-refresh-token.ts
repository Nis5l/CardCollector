import jwtDecode from "jwt-decode";
import axios from "../api/axios";
import { useAuth } from "./use-auth";

export const useRefreshToken = () => {
    const { setAuth } = useAuth();

    let refreshing: boolean = false;
    let promise: Promise<string> | undefined = undefined;

    const refresh = async () => {
        if(!refreshing){
            refreshing = true;
            promise = new Promise(async (resolve) => {
                let ret = undefined;
                try{
                    const response = await axios.get("/refresh");
                    const token = response.data.accessToken;

                    let decoded: { id: string, username: string } = jwtDecode(token);

                    const id = decoded.id;
                    const username = decoded.username;

                    setAuth({id, username, role: response.data.role, token });

                    ret = response.data.accessToken;
                }catch(err){
                    setAuth(undefined);
                }
                refreshing = false;
                resolve(ret);
            });
        }
        return await promise;
    }
    return refresh;
};
