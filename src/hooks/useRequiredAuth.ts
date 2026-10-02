"use client";

import { useAuth } from "@/components/auth-provider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useRequiredAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { country } = useParams<{ country: string }>();

    useEffect(() => {
        if (!loading && !user) router.push("/");
    }, [loading, user]);

    return { user, loading };
}
