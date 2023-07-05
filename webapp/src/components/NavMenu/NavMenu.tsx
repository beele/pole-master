'use client';

import { initFirebase } from "@/firebase/firebase-app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import styles from './NavMenu.module.css'

export default function NavMenu() {
    const app = initFirebase();
    //console.log(app);

    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    const [user, loading] = useAuthState(auth);

    const signIn = async () => {
        // https://firebase.google.com/docs/auth/web/password-auth
        const result = await signInWithPopup(auth, provider);
        //console.log(result.user);
    }

    const signOut = async () => {
        auth.signOut();
    }

    if (loading) {
        return <div>Loading...</div>
    }

    const testApi = async () => {
        const claims = (await user?.getIdTokenResult())?.claims;
        // TODO: Check claims!

        const jwt = await user?.getIdToken();
        console.log(jwt);

        try {
            const response = await fetch("http://localhost:3000/secure/ping", { headers: {authorization: 'Bearer ' + jwt}});
            const body = await response.json();
            alert(JSON.stringify(body, null, 4));
        } catch (error) {
            alert(JSON.stringify(error, null, 4));
        }
    }

    return (
        <header className={styles.header}>
            <h1>PoleMaster</h1>
            
            {   
                !user && 
                <div className={styles.userMenu}>
                    <span>You are not logged in!</span>
                    <button className={styles.button} onClick={signIn}>Sign In</button>
                </div>
            }
            {
                user && 
                <div className={styles.userMenu}>
                    <span>Welcome {user.displayName}</span>
                    <button className={styles.button} onClick={signOut}>Sign Out</button>
                    <button className={styles.button} onClick={testApi}>Test API</button>
                </div>
            }

        </header>
    );
}
