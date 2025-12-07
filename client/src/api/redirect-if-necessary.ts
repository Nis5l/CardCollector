import { NavigateFunction } from "react-router-dom";
import { AxiosError } from 'axios';

function redirectIfNecessary(navigate: NavigateFunction, err: AxiosError): number {
    if (err.response === undefined) return 0;

	//Unathorized
	if(err.response.status === 401) {
		switch (err.response.data.error) {
			case "Not verified":
				navigate('/verify');
				return 1;
			case "Mail not set":
				navigate('/verify/mail');
				return 2;
			default:
				navigate('/logout')
				return 3;
		}
	}

    return 0;
}

export default redirectIfNecessary;
