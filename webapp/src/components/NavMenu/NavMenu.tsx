'use client';

import styles from './NavMenu.module.css';
import { useUser } from '@/hooks/useUser';

export default function NavMenu() {
    const user = useUser();

    const signIn = async () => {
        window.location.replace('http://localhost:3000/auth/google?redirect_uri=' + window.location);
    };
    const signOut = async () => {
        window.location.replace('http://localhost:3000/auth/logout?redirect_uri=' + window.location);
    };

    /*const testApi = async () => {
        const response = await fetch('http://localhost:3000/poles/user', {credentials: 'include'});
        const userPoles = await response.json();
        alert(JSON.stringify(userPoles, null, 4));
    }*/

    return (
        <header className={styles.header}>
            <h1 className={styles.title}>PoleMaster</h1>

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
                </div>
            )}
        </header>
    );
}
