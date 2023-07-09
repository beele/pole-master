import axios from 'axios';

export const addTokenRefreshInterceptor = () => {
    let pendingTokenRefresh: boolean = false;

    axios.interceptors.request.use(
        (config) => {
            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );

    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            if (error.response.status === 401 && error.response.data === 'Token expired' && !originalRequest._retry) {
                if (!pendingTokenRefresh) {
                    pendingTokenRefresh = true;
                } else {
                    return Promise.reject(error);
                }

                const response = await fetch('http://localhost:3000/auth/refresh', { credentials: 'include' });
                
                if (response.status === 200) {
                    pendingTokenRefresh = false;
                    originalRequest._retry = true;
                    // Retry original request!
                    return axios(originalRequest);
                } else {
                    // Cannot refresh token!
                    pendingTokenRefresh = false;
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        },
    );
};
