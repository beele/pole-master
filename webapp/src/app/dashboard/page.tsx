import PoleList from "@/components/PoleList/PoleList";
import styles from './page.module.scss';
import { getServerSession } from "next-auth/next"

export default async function Dashboard() {
    const session = await getServerSession();

    if (!session) {
        return <main className={styles.main}>Not logged in!</main>
    }

    return (
        <main className={styles.main}>
            <PoleList></PoleList>
        </main>
    );
}
