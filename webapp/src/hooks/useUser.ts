import { useEffect, useState } from "react";
import { User } from "../../../api/node_modules/@prisma/client";

export function useUser(): User | null {
    const [user, setUser] = useState<User | null>(null);

    const getUser = async () => {
        try {
            const response = await fetch('http://localhost:3000/secure/user', { credentials: 'include' });
            const body = await response.json();
            return body;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        getUser()
            .then((user) => {
                if (user) {
                    setUser(user as any);
                }
            })
            .catch((error) => {
                setUser(null);
            });
    }, []);

    return user;
}
