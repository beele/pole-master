'use client';

import { useEffect, useState } from 'react';
import styles from './NavMenu.module.css';

export default function NavMenu() {
    const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);

    const signIn = async () => {
        window.location.replace('http://localhost:3000/auth/google?redirect_uri=' + window.location);
    };
    const signOut = async () => {
        window.location.replace('http://localhost:3000/auth/logout?redirect_uri=' + window.location);
    };

    const getUser = async () => {
        try {
            const response = await fetch('http://localhost:3000/secure/user', { credentials: 'include' });
            const body = await response.json();
            return body;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        getUser()
            .then((user) => {
                if (user) {
                    setUser(user as any);
                }
            })
            .catch((error) => {
                setUser(null);
            });
    }, []);

    return (
        <header className={styles.header}>
            <h1>PoleMaster</h1>

            {!user && (
                <div className={styles.userMenu}>
                    <span>You are not logged in!</span>
                    <button className={styles.button} onClick={signIn}>
                        Sign In
                    </button>
                </div>
            )}
            {user && (
                <div className={styles.userMenu}>
                    <span>Welcome {user.firstName}</span>
                    <button className={styles.button} onClick={signOut}>
                        Sign Out
                    </button>
                    <button className={styles.button} onClick={getUser}>
                        Test API
                    </button>
                </div>
            )}
        </header>
    );
}
