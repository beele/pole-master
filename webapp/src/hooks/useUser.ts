import { useEffect, useState } from "react";
import { User } from "../../../api/node_modules/@prisma/client";
import axios from "axios";

export function useUser(): [boolean, User | null] {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);

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

    useEffect(() => {
        setLoading(true);
        getUser()
            .then((user) => {
                if (user) {
                    setLoading(false);
                    setUser(user as any);
                }
            })
            .catch((error) => {
                setLoading(false);
                setUser(null);
            });
    }, []);

    return [loading, user];
}
