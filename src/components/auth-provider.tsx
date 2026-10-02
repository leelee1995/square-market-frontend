"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type User = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    municipality: string;
    administrativeDivision: string;
    country: string;
};

export type AuthContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/auth/me", {
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch current user");
            }

            const data: User = await res.json();

            setUser(data);
        } catch (err) {
            throw new Error("Failed to refresh user data");
        }
    };

    useEffect(() => {
        async function checkSession() {
            fetch("http://localhost:8080/api/auth/me", {
                method: "GET",
                credentials: "include",
            })
                .then((res) => {
                    if (res.ok) return res.json().then(setUser);
                    // 401 -> not logged in, user stays null - not an error to handle
                })
                .finally(() => setLoading(false)); // always resolves loading, even if the request itself fails outright
        }

        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");

    return ctx;
}
