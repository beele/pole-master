import PoleList from "@/components/PoleList/PoleList";
import axios from "axios";
import { getServerSession } from "next-auth/next"

export default async function Dashboard() {
    const session = await getServerSession();

    if (!session) {
        // redirect or render something else
        return <main>Not logged in!</main>
    }

    return (
        <main>
            <PoleList></PoleList>
        </main>
    );
}
