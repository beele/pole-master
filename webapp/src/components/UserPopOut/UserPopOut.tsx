'use client';

import { addTokenRefreshInterceptor } from '@/utils/fetch-interceptor';
import { useEffect, useState } from 'react';
import { FaRegUserCircle } from 'react-icons/fa';

import styles from './UserPopOut.module.scss';
import { User } from 'prisma-client';
import axios from 'axios';
import { clearUser, setLoading, setUser } from '@/utils/GlobalRedux/features/user/UserSlice';
import { useAppDispatch, useAppSelector } from '@/utils/GlobalRedux/hooks';
import { RootState } from '@/utils/GlobalRedux/store';

export function UserPopOut() {
    const user: User | null = useAppSelector((state: RootState) => state.user.value);
    const loading: boolean = useAppSelector((state: RootState) => state.user.loading);
    const dispatch = useAppDispatch();

    //const [loading, user] = useUser();
    const [collapsed, setCollapsed] = useState<boolean>(true);

    const getUser = async () => {
        try {
            const response = await axios.get<User>('http://localhost:3000/secure/user', { withCredentials: true });
            if (response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    const openOrClosePopOut = () => {
        setCollapsed(!collapsed);
    };

    const signIn = async () => {
        window.location.replace('http://localhost:3000/auth/google?redirect_uri=' + window.location);
    };
    const signOut = async () => {
        window.location.replace('http://localhost:3000/auth/logout?redirect_uri=' + window.location);
    };

     useEffect(() => {
        addTokenRefreshInterceptor();
        dispatch(setLoading(true));
        getUser()
            .then((user) => {
                dispatch(setLoading(false));
                if (user) {
                    dispatch(setUser(user as any));
                }
            })
            .catch((error) => {
                dispatch(setLoading(false));
                dispatch(clearUser());
            });
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
