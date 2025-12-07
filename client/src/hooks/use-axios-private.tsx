import axios from "../api/axios";
import AXIOS, { AxiosInstance } from 'axios';
import { useEffect } from "react";
import { useRefreshToken } from "./use-refresh-token";
import { useAuth } from "./use-auth";
import { AxiosError } from "axios";

export const useAxiosPrivate: (() => AxiosInstance) = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    //TODO: fix? idk

    const requestInterceptor = axios.interceptors.request.use(
        config => {
            if(config.headers["Authorization"] == null){
                if(auth != null){
                    config.headers['Authorization'] = `Bearer ${auth?.token}`;
                }
            }
            return config;
        }, (error) =>  Promise.reject(error)
    )

    const responseIntercept = axios.interceptors.response.use(
        response => response,
        async (error: Error | AxiosError) => {
            if(AXIOS.isAxiosError(error)){
                const axiosError: AxiosError = error as AxiosError;
                const prevRequest = axiosError.config;
                if(axiosError.response != null && (axiosError.response?.status === 401 && axiosError.response.data.error === "Authorization token expired")){
                    axiosError.isAxiosError = false;

                    const newAccessToken = await refresh();
                    prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                    return axios(prevRequest);
                }
            }
            return Promise.reject(error);
        }
    );

    useEffect(() => {
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseIntercept);
        }
    }, [requestInterceptor, responseIntercept]);

    return axios;
}

export type AxiosPrivateProps = {
    axios: AxiosInstance
}

export const withAxiosPrivate = (Component: any) => {
    return (props: any) => {
        const axios = useAxiosPrivate();

        return <Component axios={axios} {...props} />
    }
}
