"use client";

import { useRequiredAuth } from "@/hooks/useRequiredAuth";
import { ApiError } from "@/lib/api-error";
import { getCsrfToken } from "@/lib/csrf";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import {
    LuBookMarked,
    LuFlame,
    LuHouse,
    LuInfo,
    LuLaptop,
    LuLogOut,
    LuMenu,
    LuPlus,
    LuSettings,
    LuShirt,
    LuSquare,
    LuStore,
    LuUser,
} from "react-icons/lu";
import { useAuth } from "../auth-provider";
import { Toast } from "../toast";
import { useToast } from "@/hooks/useToast";

interface AppShellProps {
    children: ReactNode;
}
interface Navigation {
    url: string;
    category: string;
    icon: React.JSX.Element;
}

const CATEGORY_URL = "#"; //  TODO: /{country}/categories/{category}
const NAVIGATIONS: Navigation[] = [
    {
        url: `${CATEGORY_URL}apprel-fashion`,
        category: "Apparel & Fashion",
        icon: <LuShirt size={20} />,
    },
    {
        url: `${CATEGORY_URL}electronics`,
        category: "Electronics",
        icon: <LuLaptop size={20} />,
    },
];
const COLORS = [
    "bg-red-300",
    "bg-orange-300",
    "bg-yellow-300",
    "bg-green-300",
    "bg-blue-300",
    "bg-purple-300",
    "bg-pink-300",
];

export default function AppShell({ children }: AppShellProps) {
    const [draw, setDraw] = useState<boolean>(true);
    const [isTablet, setIsTablet] = useState<boolean>(false); // always false on first render, server AND client

    useEffect(() => {
        const tabletQuery = window.matchMedia(
            "(min-width: 768px) and (max-width: 1023px)",
        );

        // Set the real value only after mount — this is client-only and runs after hydration
        setIsTablet(tabletQuery.matches);

        function handleChange(e: MediaQueryListEvent) {
            setIsTablet(e.matches);
        }

        tabletQuery.addEventListener("change", handleChange);
        return () => tabletQuery.removeEventListener("change", handleChange);
    }, []);

    const effectiveDraw = isTablet ? false : draw;

    return (
        <div className="flex h-screen flex-col">
            {/* Navbar - full width, above everything */}
            <div className="absolute top-0 w-full bg-base-100/70 backdrop-blur-2xl pb-1 pr-2 z-30">
                <TopBarFirstRow />
                <TopBarSecondRow draw={effectiveDraw} />
            </div>

            {/* Drawer now only fills the space below the navbar */}
            <div className="drawer lg:drawer-open flex-1 overflow-hidden">
                <input
                    id="my-drawer-4"
                    type="checkbox"
                    checked={draw}
                    onChange={(e) => setDraw(e.target.checked)}
                    className="drawer-toggle"
                />

                <div className="drawer-content overflow-y-auto">
                    {/* Page content here */}
                    <div className="relative p-4 pt-25">{children}</div>
                </div>

                <SideBar />
            </div>
        </div>
    );
}

function TopBarFirstRow(): React.JSX.Element {
    const router = useRouter();
    const { user, loading } = useRequiredAuth();
    const { setUser } = useAuth();
    const { country } = useParams<{ country: string }>();
    const [bg] = useState<string>(() => _randomColor());
    const { success, error } = useToast();

    async function logout(): Promise<void> {
        try {
            const token = getCsrfToken();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "X-XSRF-TOKEN": token ?? "",
                    },
                },
            );

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new ApiError(
                    data.message ?? "Logout failed.",
                    res.status,
                    data.fieldErrors,
                );
            }
            setUser(null);
            success("You have logged out.");
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <nav className="navbar">
            <div className="flex-none">
                <label
                    htmlFor="my-drawer-4"
                    aria-label="open sidebar"
                    className="btn btn-square btn-ghost drawer-button hover:btn-primary"
                >
                    <LuMenu size={20} />
                </label>
            </div>
            <div className="flex-1">
                <a
                    href="/"
                    className="btn btn-ghost text-xl hover:bg-base-content/20"
                >
                    <LuSquare />
                    <span>Market</span>
                </a>
            </div>
            <div className="flex-none">
                <button className="btn btn-ghost btn-circle text-xl hover:bg-base-content/20">
                    <LuBookMarked />
                </button>
                {user === null && (
                    <Link
                        href={`/${country}/register`}
                        tabIndex={0}
                        className="btn btn-ghost btn-circle avatar"
                    >
                        <div className="avatar avatar-placeholder">
                            <div className="bg-base-content/20 text-xl text-neutral-content w-9 rounded-full">
                                <LuUser />
                            </div>
                        </div>
                    </Link>
                )}
                {user !== null && (
                    <>
                        <Link
                            href={`/${country}/my-stall/new`}
                            className="btn btn-ghost btn-circle border border-base-content/20 text-base-content/20 ml-2 hover:border-base-content hover:text-base-content"
                        >
                            <LuPlus />
                        </Link>
                        <div className="dropdown dropdown-end ml-2">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-circle avatar avatar-placeholder"
                            >
                                <div>{user?.username?.[0].toUpperCase()}</div>
                            </div>
                            <ul
                                tabIndex={-1}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                            >
                                <li>
                                    <Link href={`/${country}/my-stall`}>
                                        <span>
                                            <LuStore />
                                        </span>
                                        My Stall
                                    </Link>
                                </li>
                                <li>
                                    <Link href={`/${country}/settings`}>
                                        <span>
                                            <LuSettings />
                                        </span>
                                        Settings
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        className="btn"
                                        onClick={() =>
                                            logout().then(() =>
                                                router.push("/"),
                                            )
                                        }
                                    >
                                        <span>
                                            <LuLogOut />
                                        </span>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}

function TopBarSecondRow({ draw }: { draw: boolean }): React.JSX.Element {
    return (
        <div className="flex items-center gap-11 ml-8 lg:ml-0">
            <div
                className={`shrink-0 transition-[width] duration-200 ease-in-out hidden lg:block ${draw ? "w-64" : "w-14"}`}
            >
                <ul className="menu w-full grow">
                    <li>
                        <button
                            className={`p-3 ${!draw ? "tooltip tooltip-right" : ""}`}
                            data-tip="Home"
                        >
                            <LuHouse size={20} />
                            <span
                                className={`font-bold ${!draw ? "hidden" : ""}`}
                            >
                                Home
                            </span>
                        </button>
                    </li>
                </ul>
            </div>
            <div className="flex w-full items-center gap-3">
                <ul className="flex items-center gap-2">
                    <li>
                        <Link
                            href="#all"
                            className="btn bg-base-content text-base-300"
                        >
                            All
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#sales"
                            className="btn btn-soft hover:bg-base-content/20"
                        >
                            Sales
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#wanted-posts"
                            className="btn btn-soft hover:bg-base-content/20"
                        >
                            Wanted Posts
                        </Link>
                    </li>
                </ul>
                <div className="divider divider-horizontal"></div>
                <div className="tooltip tooltip-info">
                    <div className="flex items-center tooltip-content font-bold gap-1">
                        <LuInfo />
                        <span>Feature is under development.</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter tag(s)"
                        className="input"
                        disabled
                    />
                </div>
            </div>
        </div>
    );
}

function SideBar(): React.JSX.Element {
    return (
        <div className="drawer-side mt-34 h-[calc(100%-4rem)] is-drawer-close:overflow-visible">
            <label
                htmlFor="my-drawer-4"
                aria-label="close sidebar"
                className="drawer-overlay"
            ></label>
            <div className="flex h-full flex-col items-start bg-base-100/70 backdrop-blur-xl is-drawer-close:w-14 is-drawer-open:w-64">
                <ul className="menu w-full grow pt-0">
                    <li>
                        <button
                            className="font-bold p-3 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                            data-tip="Hot Search"
                        >
                            <LuFlame size={20} />
                            <span className="is-drawer-close:hidden">
                                Hot Search
                            </span>
                        </button>
                    </li>
                    <div className="divider"></div>
                    {NAVIGATIONS.map((nav, index) => (
                        <Navigations key={index} item={nav} />
                    ))}
                </ul>
            </div>
        </div>
    );
}

function Navigations({ item }: { item: Navigation }): React.JSX.Element {
    return (
        <li className="mb-5">
            <button
                className="font-bold p-3 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip={item.category}
            >
                {item.icon}
                <span className="is-drawer-close:hidden">{item.category}</span>
            </button>
        </li>
    );
}

function _randomColor(): string {
    const rn = Math.floor(Math.random() * COLORS.length);
    return COLORS[rn];
}
