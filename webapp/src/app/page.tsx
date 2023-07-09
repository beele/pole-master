import PoleList from '@/components/PoleList/PoleList';
import styles from './page.module.css';

export default function Home() {

    return (
        <main className={styles.main}>
            <PoleList></PoleList>
        </main>
    );
}
