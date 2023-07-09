import { useEffect, useState } from "react";
import { User } from "../../../api/node_modules/@prisma/client";
import axios from "axios";

export function useUser(): User | null {
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
