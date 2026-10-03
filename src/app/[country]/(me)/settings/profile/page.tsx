"use client";

import { useAuth } from "@/components/auth-provider";
import { useRequiredAuth } from "@/hooks/useRequiredAuth";
import { getCsrfToken } from "@/lib/csrf";
import { env } from "@/lib/env";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LuInfo, LuSettings, LuUser } from "react-icons/lu";

/*  --  TEMPORARY DATA FOR DEMONSTRATION PURPOSES   --  */
const COUNTRIES: { name: string; iso2: string }[] = [
    { name: "Brazil", iso2: "BR" },
    { name: "United States", iso2: "US" },
];
const ADMINISTRATIVE_DIVISIONS: {
    name: string;
    country: string;
    iso2: string;
}[] = [
    { name: "São Paulo", country: "Brazil", iso2: "SP" },
    { name: "New York", country: "United States", iso2: "NY" },
    { name: "California", country: "United States", iso2: "CA" },
];
const MUNICIPALITIES: {
    name: string;
    administrativeDivision: string;
    country: string;
}[] = [
    {
        name: "São Paulo",
        administrativeDivision: "São Paulo",
        country: "Brazil",
    },
    {
        name: "Taboão da Serra",
        administrativeDivision: "São Paulo",
        country: "Brazil",
    },
    {
        name: "New York City",
        administrativeDivision: "New York",
        country: "United States",
    },
    {
        name: "San Francisco",
        administrativeDivision: "California",
        country: "United States",
    },
];

type Profile = {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    country: string | null;
    adminDiv: string | null;
    muni: string | null;
};

export default function Profile(): React.JSX.Element | null {
    const { user, loading } = useRequiredAuth();
    const { refresh } = useAuth();
    const { country } = useParams<{ country: string }>();
    const router = useRouter();

    const [index, setIndex] = useState<number>(0);
    const [processing, setProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const [profile, setProfile] = useState<Profile>({
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        username: user?.username ?? "",
        country: user?.country ?? "",
        adminDiv: user?.administrativeDivision ?? "",
        muni: user?.municipality ?? "",
    });

    useEffect(() => {
        if (!user) return;

        setProfile({
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            email: user.email ?? "",
            username: user.username ?? "",
            country: user.country ?? "",
            adminDiv: user.administrativeDivision ?? "",
            muni: user.municipality ?? "",
        });
    }, [user]);

    if (!user) return null;
    if (loading) {
        return (
            <div className="flex grow justify-center items-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    const NAVIGATION_ITEMS = [
        {
            label: "Profile",
            endpoint: `settings/profile`,
            icon: <LuUser />,
        },
        {
            label: "Account",
            endpoint: `settings/account`,
            icon: <LuSettings />,
        },
    ];

    function handleOnChangeTabs(i: number): void {
        setIndex(i);
    }

    async function handleOnSubmit(
        e: React.FormEvent<HTMLFormElement>,
    ): Promise<void> {
        e.preventDefault();

        setProcessing(true);

        const patch = async (endpoint: string, json: {}) => {
            const res = await fetch(
                `${env("BACKEND_URL")}/auth/me/${endpoint}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-XSRF-TOKEN": getCsrfToken() ?? "",
                    },
                    body: JSON.stringify(json),
                },
            );

            if (!res.ok) {
                throw new Error(`Failed to update ${endpoint}`);
            }
        };

        try {
            await Promise.all([
                patch("username", { username: profile.username }),
                patch("name", {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                }),
                patch("email", { email: profile.email }),
                patch("location", {
                    country: profile.country,
                    administrativeDivision: profile.adminDiv,
                    municipality: profile.muni,
                }),
            ]);

            setError("");

            await refresh();
        } catch (err) {
            setProcessing(false);
            setError(
                "SquareMarket couldn't update your profile. Please try again.",
            );
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="flex flex-col grow justify-center items-center gap-2 mt-10">
            <div className="flex justify-center items-center text-sm text-blue-400 bg-blue-400/20 border w-full px-2 py-1 gap-1">
                <LuInfo />
                <p>
                    Please note: This is a demo environment. All user accounts
                    and data may be deleted when the demo is updated.
                </p>
            </div>

            <div className="flex w-full lg:w-4/5 gap-4">
                {/* Vertical tab navigation */}
                <div
                    role="tablist"
                    aria-label="Setting tab navigations"
                    className="flex flex-col w-48 shrink-0 gap-1"
                >
                    {NAVIGATION_ITEMS.map((item, i) => (
                        <button
                            key={`${item.label}${i}`}
                            role="tab"
                            aria-selected={index === i}
                            onClick={() => handleOnChangeTabs(i)}
                            className={`btn btn-ghost justify-start gap-2 ${
                                index === i ? "btn-active" : ""
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {index === 0 && (
                    <div className="flex flex-col flex-1 px-3 py-1.5">
                        <h3>PROFILE</h3>
                        <div className="divider"></div>
                        {error && (
                            <p className="text-sm bg-red-400/20 text-red-400 rounded-sm mt-1 p-1">
                                {error}
                            </p>
                        )}
                        <form
                            onSubmit={handleOnSubmit}
                            className="flex flex-col gap-5 w-150 mt-5"
                        >
                            <fieldset
                                className="flex gap-2"
                                disabled={processing}
                            >
                                <div className="flex flex-col w-1/2">
                                    <label className="label">First Name</label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        placeholder="First name"
                                        className="input w-full"
                                        value={profile.firstName}
                                        onChange={(e) =>
                                            setProfile((prev) => ({
                                                ...prev,
                                                firstName:
                                                    e.target.value.toUpperCase(),
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="flex flex-col w-1/2">
                                    <label className="label">
                                        Last Name (Optional)
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        className="input w-full"
                                        value={profile.lastName}
                                        onChange={(e) =>
                                            setProfile((prev) => ({
                                                ...prev,
                                                lastName:
                                                    e.target.value.toUpperCase(),
                                            }))
                                        }
                                    />
                                </div>
                            </fieldset>

                            <div className="flex flex-col">
                                <label className="label">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    className="input w-full"
                                    placeholder="Enter a username"
                                    value={profile.username}
                                    onChange={(e) =>
                                        setProfile((prev) => ({
                                            ...prev,
                                            username: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="label">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input w-full"
                                    placeholder="Enter an email"
                                    value={profile.email}
                                    onChange={(e) =>
                                        setProfile((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    disabled={processing}
                                    required
                                />
                            </div>

                            <fieldset className="flex gap-1">
                                <select
                                    className="select w-full"
                                    value={profile.country ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value || null;
                                        setProfile((prev) => ({
                                            ...prev,
                                            country: value,
                                            adminDiv: null,
                                            muni: null,
                                        }));
                                    }}
                                    required
                                >
                                    <option value="" disabled>
                                        Country
                                    </option>
                                    {COUNTRIES.map((c) => (
                                        <option key={c.iso2} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="select w-full"
                                    value={profile.adminDiv ?? ""}
                                    disabled={!profile.country}
                                    onChange={(e) => {
                                        const value = e.target.value || null;
                                        setProfile((prev) => ({
                                            ...prev,
                                            adminDiv: value,
                                            muni: null,
                                        }));
                                    }}
                                    required
                                >
                                    <option value="" disabled>
                                        Administrative Division
                                    </option>
                                    {ADMINISTRATIVE_DIVISIONS.filter(
                                        (division) =>
                                            division.country ===
                                            profile.country,
                                    ).map((division) => (
                                        <option
                                            key={division.iso2}
                                            value={division.name}
                                        >
                                            {division.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="select w-full"
                                    value={
                                        profile.adminDiv
                                            ? (profile.muni ?? "")
                                            : ""
                                    }
                                    disabled={!profile.adminDiv}
                                    onChange={(e) => {
                                        const value = e.target.value || null;
                                        setProfile((prev) => ({
                                            ...prev,
                                            muni: value,
                                        }));
                                    }}
                                    required
                                >
                                    <option value="" disabled>
                                        Municipality
                                    </option>
                                    {MUNICIPALITIES.filter(
                                        (municipality) =>
                                            municipality.administrativeDivision ===
                                            profile.adminDiv,
                                    ).map((municipality) => (
                                        <option
                                            key={municipality.name}
                                            value={municipality.name}
                                        >
                                            {municipality.name}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={processing}
                            >
                                {processing && (
                                    <span className="loading loading-spinner loading-sm"></span>
                                )}
                                Update profile
                            </button>
                        </form>
                    </div>
                )}

                {index === 1 && (
                    <div className="flex flex-1 justify-center items-center">
                        <p>Coming Soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}
