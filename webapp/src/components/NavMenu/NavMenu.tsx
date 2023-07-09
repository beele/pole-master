'use client';

import styles from './NavMenu.module.css';
import Image from 'next/image';

import { useUser } from '@/hooks/useUser';

import { FaRegUserCircle } from 'react-icons/fa';
import { useEffect } from 'react';
import { addTokenRefreshInterceptor } from '@/utils/fetch-interceptor';

export default function NavMenu() {
    const user = useUser();

    const signIn = async () => {
        window.location.replace('http://localhost:3000/auth/google?redirect_uri=' + window.location);
    };
    const signOut = async () => {
        window.location.replace('http://localhost:3000/auth/logout?redirect_uri=' + window.location);
    };

    // TODO: This should be on a higher level and only ever be executed once!
    useEffect(() => {
        addTokenRefreshInterceptor();
    }, [])

    return (
        <>
            <header className={styles.header}>
                <span className={styles.title}>PoleMaster</span>
                <div className={styles.userMenu}>
                    {!user && (
                        <>
                            <span>You are not logged in!</span>
                            <button className={styles.button} onClick={signIn}>
                                Sign In
                            </button>
                        </>
                    )}
                    {user && (
                        <>
                            <span>Welcome {user.firstName}</span>
                            <FaRegUserCircle />
                            <button className={styles.button} onClick={signOut}>
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
            </header>
            <Image className={styles.banner} src="/banner.jpg" width={500} height={500} alt="Banner image" />
        </>
    );
}
