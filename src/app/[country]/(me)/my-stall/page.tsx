"use client";

import ListingCard from "@/components/server/listing-card";
import { useRequiredAuth } from "@/hooks/useRequiredAuth";
import { getCsrfToken } from "@/lib/csrf";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LuCheck, LuPencil, LuPlus, LuTrash } from "react-icons/lu";

function LoadingStall(): React.JSX.Element {
    return <>Loading stall...</>;
}

export default function MyStall(): React.JSX.Element {
    const router = useRouter();
    const { user, loading } = useRequiredAuth();
    const { country } = useParams<{ country: string }>();

    const [id, setId] = useState<string | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);

    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!user && !loading) router.replace("/");
        if (!user) return;

        const getMyListing = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/listings/mine`,
                    {
                        method: "GET",
                        credentials: "include",
                    },
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch user's listings.");
                }

                const result = await res.json();

                setListings(result);

                console.log(result);
                //setListings(await res.json());
            } catch (err) {
                throw new Error("Server request failed.");
            }
        };

        getMyListing();
    }, [user, loading, router]);

    if (loading) return <>Loading your stall...</>;

    async function deleteVercelBlob(url: string) {
        await fetch("/api/upload", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url }),
        });
    }

    async function deleteListing(listing: Listing) {
        setId(listing.id);

        try {
            const token = await getCsrfToken();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/listings/${listing.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-XSRF-TOKEN": token,
                    },
                },
            );

            if (!res.ok) {
                throw new Error("Failed to delete listing.");
            }

            setListings((prev) =>
                prev.filter((item) => item.id !== listing.id),
            );

            await Promise.all(listing.images.map(deleteVercelBlob));
        } catch (error) {
            throw new Error("Server request failed.");
        } finally {
            setId(null);
        }
    }

    return (
        <Suspense fallback={<LoadingStall />}>
            <div className="@container flex flex-col w-full gap-2">
                <h3>My Stall</h3>
                <div className="divider"></div>
                <div className="grid grid-cols-2 @[900]:grid-cols-3 @[1440]:grid-cols-4 w-full my-2">
                    <Link
                        href={`/${country}/my-stall/new`}
                        className="btn btn-ghost btn-primary size-20"
                    >
                        <LuPlus />
                    </Link>

                    {listings.length > 0 &&
                        listings.map((listing, i) => (
                            <div
                                key={i}
                                className="group rounded-md p-2 hover:bg-mist-500/20"
                            >
                                <ListingCard listing={listing} />
                                <div className="invisible flex justify-end items-center gap-2 group-hover:visible">
                                    <div
                                        className="tooltip tooltip-primary"
                                        data-tip="Edit"
                                    >
                                        <button className="btn btn-soft btn-square btn-primary">
                                            <LuPencil />
                                        </button>
                                    </div>
                                    {listing.status === "DRAFT" && (
                                        <div
                                            className="tooltip tooltip-success"
                                            data-tip="Sell item"
                                        >
                                            <button className="btn btn-soft btn-square btn-success">
                                                <LuCheck />
                                            </button>
                                        </div>
                                    )}
                                    <div
                                        className="tooltip tooltip-error"
                                        data-tip="Remove item"
                                    >
                                        <button
                                            className="btn btn-soft btn-square btn-error"
                                            onClick={() =>
                                                deleteListing(listing)
                                            }
                                        >
                                            <LuTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </Suspense>
    );
}
