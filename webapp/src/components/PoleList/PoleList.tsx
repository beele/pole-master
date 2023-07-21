'use client';

import styles from './PoleList.module.scss';
import { useEffect, useState } from 'react';
import PoleListItem from '../PoleListItem/PoleListItem';
import axios from 'axios';
import { Pole, User } from 'prisma-client';

import { useSession } from 'next-auth/react';

export default function PoleList() {
    const { data: session, status } = useSession();

    const [poles, setPoles] = useState<Pole[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loading = false;

    const getPolesForUser = async (): Promise<Pole[]> => {
        const response = await axios.get('http://localhost:3000/poles/user', { headers: {'access_token': (session as any).accessToken ?? ''} });
        const userPoles = response.data;
        console.log(userPoles);
        return userPoles ?? [];
    };

    useEffect(() => {
        if (!session?.user) {
            return;
        }

        console.log(session);

        getPolesForUser()
            .then((poles) => setPoles(poles))
            .catch((error) => {
                console.warn(error);
                setPoles([]);
                setError('Could not retrieve poles for user!');
            });
    }, [session]);

    return (
        <>
            {loading && !session?.user && <span>Loading...</span>}
            {!loading && !session?.user && <span>Please log in.</span>}
            {!loading && session?.user && poles.length === 0 && <span>You don&apos;t have any poles yet</span>}
            {!loading && poles.length > 0 && (
                <ul className={styles.list}>
                    {poles.map((pole) => (
                        <PoleListItem key={pole.id} pole={pole} />
                    ))}
                </ul>
            )}
        </>
    );
}
