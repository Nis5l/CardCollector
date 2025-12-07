import { RouteProps } from "react-router";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks"

type Props = RouteProps & {
    allowedRoles?: number[]
}

const RequireAuth = ({allowedRoles, ...rest }: Props) => {
    const { auth } = useAuth();
    const location = useLocation();
    
    if(allowedRoles == null) allowedRoles = [];
    const roles: number[] = allowedRoles;
    
    const shouldCheckforRoles: boolean = roles.length !== 0;

    return (
        auth != null
            ? (shouldCheckforRoles ? (roles.includes(auth.role) ? <Outlet /> : <Navigate to="/dashboard" />) : <Outlet />)
            : <Navigate to="/login" state={{from: location}} replace />
    );
}

export default RequireAuth;
