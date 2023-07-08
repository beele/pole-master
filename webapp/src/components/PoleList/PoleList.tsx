'use client';

import styles from './PoleList.module.css';
import { useUser } from '@/hooks/useUser';
import { Pole } from "../../../../api/node_modules/@prisma/client";
import { useEffect, useState } from 'react';

export default function PoleList() {
    const user = useUser();

    const [poles, setPoles] = useState<Pole[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getPolesForUser = async (): Promise<Pole[]> => {
        const response = await fetch('http://localhost:3000/poles/user', {credentials: 'include'});
        const userPoles = await response.json();
        console.log(userPoles);
        return userPoles ?? [];
    }

    useEffect(() => {
        getPolesForUser()
            .then((poles) => setPoles(poles))
            .catch((error) => {
                console.warn(error);
                setPoles([]);
                setError('Could not retrieve poles for user!');
            });
    }, []);

    return (
        <div>
            {
                poles.length === 0 && (
                <span>You don&apos;t have any poles yet</span>
            )}
            {
                poles.length > 0 && (
                <ul>
                    {poles.map((pole) => <li key={pole.id}>{pole.name}</li>)}
                </ul>
            )}
        </div>
    );
}
