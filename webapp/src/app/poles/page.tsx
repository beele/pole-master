import PoleList from '@/components/PoleList/PoleList';
import styles from './page.module.scss';
import { getServerSession } from 'next-auth/next';
import { Pole } from 'prisma-client';
import { getWithAuth } from '@/utils/authenticated-request';
import { nextAuthOptions } from '@/auth/auth-options';

export default async function AllPoles() {
    const session = await getServerSession(nextAuthOptions);
    let poles: Pole[] = [];

    console.log(session);
    if (!session) {
        return <main className={styles.main}>Not logged in!</main>;
    }

    try {
        poles = await getWithAuth<Pole[]>('http://localhost:3000/poles', {}, session);
    } catch (error) {
        // TODO: Show error!
        poles = [];
    }

    return (
        <main className={styles.main}>
            <PoleList poles={poles}></PoleList>
        </main>
    );
}
