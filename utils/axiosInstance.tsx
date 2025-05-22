import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://192.168.1.14:4080',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;
