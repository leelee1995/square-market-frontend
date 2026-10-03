import { cookies } from "next/headers";
import { getListings } from "@/lib/listings";
import ListingCard from "@/components/server/listing-card";
import { Suspense } from "react";
import Link from "next/link";
import { LuChevronRight, LuMapPin } from "react-icons/lu";
import { LocationPicker } from "@/components/client/location-picker";

export default async function Home({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<React.JSX.Element> {
    const { country } = await params;
    const cookieStore = await cookies();
    const language = cookieStore.get("NEXT_LOCALE")?.value || "en";
    const apparel_fashion: Listing[] = await getListings("APPAREL_FASHION");
    const electronics: Listing[] = await getListings("ELECTRONICS");

    return (
        <div className="@container flex flex-col items-start min-w-0 w-full mt-5 px-4 py-5 gap-5">
            <LocationPicker country={country} />

            <Suspense fallback={<div>Loading...</div>}>
                <CategoryList
                    category="Apparel & Fashion"
                    list={apparel_fashion}
                    country={country}
                />
                <CategoryList
                    category="Electronics"
                    list={electronics}
                    country={country}
                />
            </Suspense>
        </div>
    );
}

function CategoryList({
    category,
    list,
    country,
}: {
    category: string;
    list: Listing[];
    country: string;
}): React.JSX.Element {
    return (
        <Suspense fallback={<FallBack />}>
            <div className="flex flex-col w-full mt-5">
                <h3 className="text-xl font-semibold text-indigo-500 px-3">
                    {category}
                </h3>
                {list.length > 0 && (
                    <ul className="grid grid-cols-2 @[900]:grid-cols-3 @[1440]:grid-cols-4 w-full">
                        {list.map((item, index) => (
                            <li
                                key={index}
                                className="rounded-md transition-all duration-300 ease-in-out p-4 hover:bg-mist-500/20"
                            >
                                <ListingCard listing={item} />
                            </li>
                        ))}
                    </ul>
                )}
                {list.length === 0 && (
                    <div className="flex justify-center items-center text-mist-500 p-10">
                        <p>No neighbors are selling.</p>
                    </div>
                )}
                <div className="divider">
                    <Link
                        href={`/${country}/#${category}`}
                        className={`${list.length === 0 && "btn-disabled"} btn btn-ghost hover:btn-primary`}
                        tabIndex={list.length === 0 ? -1 : 0}
                        aria-disabled={list.length === 0 ? true : false}
                    >
                        See more <LuChevronRight size={20} />
                    </Link>
                </div>
            </div>
        </Suspense>
    );
}

function FallBack(): React.JSX.Element {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-ring loading-lg"></span>
        </div>
    );
}
