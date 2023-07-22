import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { Pole } from "prisma-client";
import { useEffect, useState } from "react";

export function useUserPoles() {
    const { data: session, status, update } = useSession();   
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [poles, setPoles] = useState<Pole[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getPolesForUser = async (): Promise<Pole[]> => {
        setLoading(true);
        
        let userPoles: Pole[] = [];
        try {
            const response = await axios.get<Pole[]>('http://localhost:3000/poles/user', {
                headers: { access_token: session?.accessToken ?? '' },
            });
            userPoles = response.data ?? [];
        } catch (error) {
            if ((error as AxiosError)?.response?.status === 401 && (error as AxiosError)?.response?.data === 'Unauthorized') {
                const [accessToken, refreshToken] = await performTokenRefresh();
                // Set new Access and refresh tokens on the session and update it (so the server side also gets these)!
                // Recursively call this function again to actually fetch the poles now!
                update({accessToken, refreshToken});   
                return getPolesForUser();
            }
        }

        //console.log(userPoles);
        setLoading(false);
        return userPoles;
    };

    const performTokenRefresh = async (): Promise<[string | null, string | null]> => {
        const response = await fetch('http://localhost:3000/auth/refresh', { 
            headers: { refresh_token: session?.refreshToken ?? ''},
        });
        const accessToken = response.headers.get('access_token') ?? null;
        const refreshToken = response.headers.get('refresh_token') ?? null;
        return [accessToken, refreshToken];
    };

    // TODO: Auto update state of poles!
    useEffect(() => {
        if (!session?.user) {
            setPoles([]);
            return;
        }
        if (userEmail === session.user.email) {
            return;
        }
        if (!session.user?.email) {
            return;
        }
        setUserEmail(session.user.email);
        getPolesForUser()
            .then((poles) => setPoles(poles))
            .catch((error) => {
                setPoles([]);
                console.warn(error);
                setError('Could not retrieve poles for user!');
            });
    }, [session]);

    return {loading, poles, error};
}
