import styles from './page.module.scss';
import Link from 'next/link'

export default function Home() {

    return (
        <main className={styles.main}>
            <h1>Welcome!</h1>

            <Link href={`/dashboard`}>Go to dashboard</Link>
        </main>
    );
}
