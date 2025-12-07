import {
    Location,
    NavigateFunction,
    Params,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

interface RouterProps{
    location: Location,
    navigate: NavigateFunction,
    params: Readonly<Params<string>>
}

export type ReactRouterProps = {
    router: RouterProps
};

export const withRouter = (Component: any) => {
    return (props: any) => {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();

        const routerProps: RouterProps = { location, navigate, params }

        return <Component  {...props} router={routerProps} />
    }
}
