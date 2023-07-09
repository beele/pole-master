'use client';

import styles from './NavMenu.module.scss';
import Image from 'next/image';

import classNames from 'classnames';
import { UserPopOut } from '../UserPopOut/UserPopOut';

export default function NavMenu() {
    return (
        <>
            <header className={styles.header}>
                <div className={classNames(styles.wrapper, styles.invert)}>
                    <span data-text="Pole"></span>
                    <span data-text="Master"></span>
                </div>
                <UserPopOut/>
            </header>
            <Image className={styles.banner} src="/banner.jpg" width={500} height={500} alt="Banner image" />
        </>
    );
}
