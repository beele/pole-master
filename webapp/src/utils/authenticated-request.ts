import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Session } from 'next-auth';

async function performTokenRefresh(): Promise<[string | null, string | null]> {
    const response = await axios.get('http://localhost:3000/auth/refresh', {
        withCredentials: true,
    });
    //console.log(response);
    const accessToken = response.headers.access_token ?? null;
    const accessTokenExpiry = response.headers.access_token_expiry ?? null;
    return [accessToken, accessTokenExpiry];
}

export async function getWithAuth<T>(url: string, options: AxiosRequestConfig, session: Session): Promise<T> {
    try {
        /*const response = await axios.get<T>(url, {
            ...options,
            headers: { access_token: session.accessToken ?? '' },
            withCredentials: true,
        });
        console.log(response);
        return response.data;*/

        const response = await fetch(url, {
            headers: [['access_token', session.accessToken ?? '']],
            credentials: 'include',
        });
        console.log(session);
        if (response.ok) {
            return await response.json();
        }
        throw new Error(response.status + '');
    } catch (error) {
        if (
            (error as AxiosError)?.response?.status === 401 &&
            (error as AxiosError)?.response?.data === 'Token expired or invalid'
        ) {
            const [accessToken, accessTokenExpiry] = await performTokenRefresh();
            if (!accessToken) {
                throw new Error('Cannot refresh access token!');
            }

            // Set new Access and refresh tokens on the session and update it (so the server side also gets these)!
            // Calling the update does not trigger the hook!
            //sessionContext.update({accessToken, accessTokenExpiry});

            if (session.accessToken) {
                session.accessToken = accessToken;
            }
            return getWithAuth(url, options, session);
        }
        throw new Error('Cannot fetch!');
    }
}

// Other HTTP methods!
