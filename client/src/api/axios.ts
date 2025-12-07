import axios from 'axios';
import Config from "../config.json";

const BASE_URL = Config.API_HOST;

const instance = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

export default instance;