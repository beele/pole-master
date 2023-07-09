import { useUser } from '@/hooks/useUser';
import { addTokenRefreshInterceptor } from '@/utils/fetch-interceptor';
import { useEffect, useState } from 'react';
import { FaRegUserCircle } from 'react-icons/fa';

import styles from './UserPopOut.module.scss';

export function UserPopOut() {
    const [loading, user] = useUser();
    const [collapsed, setCollapsed] = useState<boolean>(true);

    const openOrClosePopOut = () => {
        setCollapsed(!collapsed);
    };

    const signIn = async () => {
        window.location.replace('http://localhost:3000/auth/google?redirect_uri=' + window.location);
    };
    const signOut = async () => {
        window.location.replace('http://localhost:3000/auth/logout?redirect_uri=' + window.location);
    };

     // TODO: This should be on a higher level and only ever be executed once!
     useEffect(() => {
        addTokenRefreshInterceptor();
    }, []);

    return (
        <>
            <FaRegUserCircle className={styles.userIcon} onClick={openOrClosePopOut} />
            { !collapsed && 
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
                            <button className={styles.button} onClick={signOut}>
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
            }
        </>
    );
}
