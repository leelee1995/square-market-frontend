"use client";

import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api-error";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LuChevronLeft } from "react-icons/lu";

export default function Login(): React.JSX.Element {
    //  -- Hooks --
    const router = useRouter();
    const { user, setUser } = useAuth();
    const { country } = useParams<{ country: string }>();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [identifier, setIdentifier] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    //  -- CSS Styles --
    const fieldsetClasses =
        "flex flex-col fieldset border border-base-100 rounded-box p-4 [&_.input]:w-full";

    useEffect(() => {
        if (user) router.push("/");
    }, [user]);

    // -- Functions --

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: identifier,
                        password: password,
                    }),
                },
            );

            const data = await res.json();

            if (!res.ok) {
                throw new ApiError(
                    data.message ?? "Login failed.",
                    res.status,
                    data.fieldErrors,
                );
            }

            setUser(data);

            router.push("/");
        } catch (err) {
            setLoading(false);

            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Failed to log in. Please try again.");
            }
        }
    }

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="card bg-base-200 shadow-md w-96 lg:w-120">
                <div className="card-body">
                    <Link
                        href="/"
                        className="btn btn-soft btn-primary self-start"
                    >
                        <span>
                            <LuChevronLeft size={20} />
                        </span>
                        GO BACK
                    </Link>
                    <form onSubmit={handleSubmit}>
                        <fieldset className="fieldset [&_.input]:w-full">
                            <label className="label">Username</label>
                            <input
                                required
                                name="username"
                                autoComplete="username"
                                type="text"
                                placeholder="Type your username"
                                className="input"
                                disabled={loading}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                            <label className="label">Password</label>
                            <input
                                required
                                type="password"
                                placeholder="Enter password"
                                className="input"
                                disabled={loading}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </fieldset>

                        <button
                            disabled={loading}
                            type="submit"
                            className="btn btn-primary w-full mt-2"
                        >
                            Login{" "}
                            {loading === true && (
                                <span className="loading loading-spinner"></span>
                            )}
                        </button>
                    </form>
                    <p className="text-xs text-center mt-2">
                        Don't have an account?{" "}
                        <Link
                            href={`/${country}/register`}
                            className="text-blue-500 underline decoration-dotted"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
