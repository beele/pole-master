'use client';

import styles from './PoleList.module.css';
import { useEffect, useState } from 'react';
import PoleListItem from '../PoleListItem/PoleListItem';
import axios from 'axios';
import { Pole, User } from 'prisma-client';
import { useAppSelector } from '@/utils/GlobalRedux/hooks';
import { RootState } from '@/utils/GlobalRedux/store';

export default function PoleList() {
    const user: User | null = useAppSelector((state: RootState) => state.user.value);
    const loading: boolean = useAppSelector((state: RootState) => state.user.loading);

    const [poles, setPoles] = useState<Pole[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getPolesForUser = async (): Promise<Pole[]> => {
        const response = await axios.get('http://localhost:3000/poles/user', { withCredentials: true });
        const userPoles = response.data;
        console.log(userPoles);
        return userPoles ?? [];
    };

    useEffect(() => {
        if (!user) {
            return;
        }

        getPolesForUser()
            .then((poles) => setPoles(poles))
            .catch((error) => {
                console.warn(error);
                setPoles([]);
                setError('Could not retrieve poles for user!');
            });
    }, [user]);

    return (
        <>
            {loading && !user && <span>Loading...</span>}
            {!loading && !user && <span>Please log in.</span>}
            {!loading && user && poles.length === 0 && <span>You don&apos;t have any poles yet</span>}
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
