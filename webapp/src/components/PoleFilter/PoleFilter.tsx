'use client';

import styles from './PoleFilter.module.scss';
import { Pole } from 'prisma-client';
import { ChangeEvent } from 'react';

export default function PoleFilter(props: { poles: Pole[] }) {

    const onFilterChange = (event: ChangeEvent) => {
        console.log((event.target as HTMLInputElement).value);
    };

    return (
        <>
            <input type='text' onChange={onFilterChange} className={styles.filter}/>
        </>
    );
}
