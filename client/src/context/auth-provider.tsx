import { Context, createContext, ReactNode, useState } from "react";
import { User } from "../shared/types";

const defaultValue: User | undefined = undefined;

interface IAuthContext {
    auth: User | undefined,
    setAuth?: any
}

const AuthContext: Context<Partial<IAuthContext>> = createContext<Partial<IAuthContext>>({ auth: defaultValue });

interface Props{
    children: ReactNode
}

export const AuthProvider = ({ children }: Props) => {
    const [ auth, setAuth ] = useState<User | undefined>(defaultValue);

    return (
        <AuthContext.Provider
            value={{
                auth,
                setAuth
            }}
        >
            { children }
        </AuthContext.Provider>
    );
}

export default AuthContext;
