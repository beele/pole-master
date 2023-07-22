'use client';

import styles from './PoleList.module.scss';
import { useEffect, useState } from 'react';
import PoleListItem from '../PoleListItem/PoleListItem';
import axios from 'axios';
import { Pole } from 'prisma-client';

import { useSession } from 'next-auth/react';
import { setLoading } from '@/utils/GlobalRedux/features/user/UserSlice';

export default function PoleList() {
    const { data: session, status } = useSession();

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [poles, setPoles] = useState<Pole[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loading = false;

    const getPolesForUser = async (): Promise<Pole[]> => {
        setLoading(true);
        const response = await axios.get<Pole[]>('http://localhost:3000/poles/user', {
            headers: { access_token: session?.accessToken ?? '' },
        });
        const userPoles: Pole[] = response.data ?? [];
        //console.log(userPoles);

        setLoading(false);
        return userPoles;
    };

    useEffect(() => {
        if (!session?.user) {
            return;
        } else {
            setPoles([]);
        }

        if (session.user.email && userEmail !== session.user.email) {
            setUserEmail(session.user.email);
        }

        getPolesForUser()
            .then((poles) => setPoles(poles))
            .catch((error) => {
                console.warn(error);
                setPoles([]);
                setError('Could not retrieve poles for user!');
            });
    }, [session, userEmail]);

    if (error) {
        return <span>{error}</span>;
    }
    if (loading) {
        return <span>Loading...</span>;
    }
    if (!session?.user) {
        return <span>Please log in.</span>;
    }
    if (poles.length > 0) {
        return (
            <ul className={styles.list}>
                {poles.map((pole) => (
                    <PoleListItem key={pole.id} pole={pole} />
                ))}
            </ul>
        );
    } else {
        return <span>You don&apos;t have any poles yet</span>;
    }
}
