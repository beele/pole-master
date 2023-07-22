'use client';

import styles from './PoleList.module.scss';
import PoleListItem from '../PoleListItem/PoleListItem';

import { useUserPoles } from '@/hooks/use-user-poles';

export default function PoleList() {
   const {loading, poles, error} = useUserPoles();

    if (error) {
        return <span>{error}</span>;
    }
    if (loading) {
        return <span>Loading...</span>;
    }
    /*if (!session?.user) {
        return <span>Please log in.</span>;
    }*/
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
