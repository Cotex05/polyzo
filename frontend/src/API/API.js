import axios from 'axios';

const api = axios.create({
    baseURL: 'https://polyzo.herokuapp.com',
});

export { api };