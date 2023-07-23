'use client';

import styles from './PoleList.module.scss';
import PoleListItem from '../PoleListItem/PoleListItem';

import { useUserPoles } from '@/hooks/use-user-poles';
import PoleFilter from '../PoleFilter/PoleFilter';
import { useEffect, useState } from 'react';
import { Pole } from 'prisma-client';

export default function PoleList() {
    const { loading, poles, error } = useUserPoles();
    const [nameFilter, setNameFilter] = useState<string | null>(null);

    const [filteredPoles, setFilteredPoles] = useState<Pole[]>([]);

    useEffect(() => {
        setFilteredPoles(
            poles.filter((pole) => {
                if (!nameFilter || nameFilter.trim() === '') {
                    return true;
                }
                return pole.name.toLowerCase().indexOf(nameFilter.toLowerCase().trim()) > -1;
            }),
        );
    }, [poles, nameFilter]);

    if (error) {
        return <span>{error}</span>;
    }
    if (loading) {
        return <span>Loading...</span>;
    }

    if (poles.length > 0 && filteredPoles.length > 0) {
        return (
            <>
                <PoleFilter poles={poles} setNameFilter={setNameFilter} />
                <ul className={styles.list}>
                    {filteredPoles.map((pole) => (
                        <PoleListItem key={pole.id} pole={pole} />
                    ))}
                </ul>
            </>
        );
    }

    if (poles.length > 0 && filteredPoles.length === 0) {
        return (
            <>
                <PoleFilter poles={poles} setNameFilter={setNameFilter} />
                <span>No poles match your filter</span>
            </>
        );
        return;
    }

    return (
        <>
            <span>You don&apos;t have any poles yet</span>;
        </>
    );
}
