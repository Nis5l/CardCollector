import React, {useEffect, useState} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { CardComponent, LogoComponent } from '../../../shared/components'
import { User } from '../../../shared/types'
import { useAuth, useAxiosPrivate } from '../../../hooks'
import { setRememberMe } from '../../../utils'

import "./login.component.scss"

function LoginComponent(props: {}) {
    const { setAuth } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const [error, setError] = useState(undefined);
    const [disabled, setDisabled] = useState(true);

    const [userwrong, setUserwrong] = useState(true);
    const [passwrong, setPasswrong] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as any;
    const from = state?.from?.pathname != null ? state.from.pathname : "/dashboard";

    const axios = useAxiosPrivate();

    function validateForm() {
        return (username.length > 0) && (password.length > 0);
    }

    function handleSubmit(event: React.SyntheticEvent) {
        setError(undefined);

        event.preventDefault();

        if (!validateForm())
            return;

        const user = {
            username: username,
            password: password
        };

        axios.post(`/login`, user)
            .then(res => {
                const userId: string = res.data.userId;
                const username: string = res.data.username;
                const role: number = res.data.role;
                const token: string = res.data.accessToken;

                const user: User = { id: userId, username, role, token };

                setAuth(user);

                setRememberMe(remember);

                navigate(from, { replace: true });
            }).catch(err => {
				setError(err.response.data.error);
			});
    }

    useEffect(() => {
        const dis = userwrong || passwrong;
        if (dis !== disabled) setDisabled(dis);
    }, [disabled, passwrong, userwrong]);

    return (

        <CardComponent styleClassName="login"
            title={''}
            icon={''}
            iconNum={0}
        >

            <LogoComponent className="logo" size="" />

            <form onSubmit={handleSubmit} autoComplete="false">

                {
                    error !== undefined &&
                    <p className="error">{error}</p>
                }
                <input
                    autoComplete="false"
                    type="text"
                    className={"text_input" + (userwrong ? " invalid" : "")}
                    name="username"
                    placeholder="Username"
                    value={username}
                    onChange={
                        (e) => {
                            setUsername(e.target.value);
                            setUserwrong(e.target.value.length < 4 || e.target.value.length > 20);
                        }
                    }
                />
                <input
                    type="password"
                    className={"text_input" + (passwrong ? " invalid" : "")}
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={
                        (e) => {
                            setPassword(e.target.value);
                            setPasswrong(e.target.value.length < 8 || e.target.value.length > 30);
                        }
                    }
                />

                <label>
                    <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
                    Remember Me
                </label>

                <input className="button_input" type="submit" name="submit" value="Login" disabled={disabled} />

            </form>

        </CardComponent>
    )
}

export default LoginComponent;
