'use client';

import { useState } from 'react';
import { FaRegUserCircle } from 'react-icons/fa';

import styles from './UserPopOut.module.scss';
import { signIn, signOut, useSession } from 'next-auth/react';

//import axios from 'axios';
//import { User } from 'prisma-client';

export function UserPopOut() {
    const { data: session, status } = useSession();
    const [collapsed, setCollapsed] = useState<boolean>(true);

    /*const getUser = async () => {
        try {
            const response = await axios.get<User>('http://localhost:3000/secure/user', { withCredentials: true });
            if (response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            return null;
        }
    };*/

    const openOrClosePopOut = () => {
        setCollapsed(!collapsed);
    };

    return (
        <>
            <FaRegUserCircle className={styles.userIcon} onClick={openOrClosePopOut} />
            { !collapsed && 
                <div className={styles.userMenu}>
                    {!session?.user && (
                        <>
                            <span>You are not logged in!</span>
                            <button className={styles.button} onClick={() => signIn()}>
                                Sign In
                            </button>
                        </>
                    )}
                    {session?.user && (
                        <>
                            <span>Welcome {session?.user.name}</span>
                            <button className={styles.button} onClick={() => signOut()}>
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
            }
        </>
    );
}
