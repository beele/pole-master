'use client';

import styles from './PoleFilter.module.scss';
import { Pole } from 'prisma-client';
import { ChangeEvent } from 'react';

export default function PoleFilter(props: { poles: Pole[], setNameFilter: (val: string) => void }) {

    const onFilterChange = (event: ChangeEvent) => {
        props.setNameFilter((event.target as HTMLInputElement).value);
    };

    return (
        <>
            <input type='text' className={styles.filter} onChange={onFilterChange} placeholder='Filter by typing a name'/>
        </>
    );
}
