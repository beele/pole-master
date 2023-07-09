'use client';

import styles from './NavMenu.module.css';
import { useUser } from '@/hooks/useUser';

import { FaRegUserCircle } from "react-icons/fa";

export default function NavMenu() {
    const user = useUser();

    const signIn = async () => {
        window.location.replace('http://localhost:3000/auth/google?redirect_uri=' + window.location);
    };
    const signOut = async () => {
        window.location.replace('http://localhost:3000/auth/logout?redirect_uri=' + window.location);
    };

    return (
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
                        <FaRegUserCircle/>
                        <button className={styles.button} onClick={signOut}>
                            Sign Out
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
