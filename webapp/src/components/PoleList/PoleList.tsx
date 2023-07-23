'use client';

import styles from './PoleList.module.scss';
import PoleListItem from '../PoleListItem/PoleListItem';

import { useUserPoles } from '@/hooks/use-user-poles';
import PoleFilter from '../PoleFilter/PoleFilter';

export default function PoleList() {
    const { loading, poles, error } = useUserPoles();

    if (error) {
        return <span>{error}</span>;
    }
    if (loading) {
        return <span>Loading...</span>;
    }

    if (poles.length > 0) {
        return (
            <>
                <PoleFilter poles={poles}/>
                <ul className={styles.list}>
                    {poles.map((pole) => (
                        <PoleListItem key={pole.id} pole={pole} />
                    ))}
                </ul>
            </>
        );
    } else {
        return <span>You don&apos;t have any poles yet</span>;
    }
}
