import Image from "next/image";
import {
    LuChevronLeft,
    LuChevronRight,
    LuEllipsisVertical,
    LuFlag,
    LuMapPin,
    LuShare2,
} from "react-icons/lu";

export default function ListingCard({
    listing,
}: {
    listing: Listing;
}): React.JSX.Element {
    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(listing.price / 100);

    function forward(index: number): string {
        const next = index === 0 ? listing.images.length - 1 : index - 1;

        return listing.id + next;
    }

    function backward(index: number): string {
        const prev = index === listing.images.length - 1 ? 0 : index + 1;

        return listing.id + prev;
    }

    return (
        <div className="card">
            <figure>
                <div className="carousel w-full">
                    {listing.images.map((url, ii) => (
                        <div
                            key={ii}
                            id={listing.id + ii}
                            className="carousel-item relative bg-mist-500/20 h-64 w-full"
                        >
                            <Image
                                alt={`${listing.title} image ${ii + 1}`}
                                src={url}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                                <a
                                    href={`#${forward(ii)}`}
                                    className="btn btn-circle"
                                >
                                    <LuChevronLeft />
                                </a>

                                <a
                                    href={`#${backward(ii)}`}
                                    className="btn btn-circle"
                                >
                                    <LuChevronRight />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </figure>
            <div className="card-body">
                <div className="flex gap-1">
                    <div className="avatar avatar-placeholder self-start">
                        <div className="bg-neutral text-neutral-content w-10 rounded-full">
                            <span className="text-2xl">
                                {listing.neighborUsername[0]}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full gap-2">
                        <div className="flex justify-between">
                            <h2 className="card-title">{listing.title}</h2>
                            <button
                                className="btn btn-circle btn-ghost"
                                popoverTarget={`popover-${listing.id}`}
                                style={{ anchorName: `anchor-${listing.id}` }}
                            >
                                <LuEllipsisVertical />
                            </button>
                            <ul
                                className="dropdown menu rounded-box bg-base-100 shadow-sm mt-2"
                                popover="auto"
                                id={`popover-${listing.id}`}
                                style={{
                                    positionAnchor: `anchor-${listing.id}`,
                                }}
                            >
                                <OptionList />
                            </ul>
                        </div>
                        <p className="text-xs text-mist-500">
                            {listing.neighborUsername}
                        </p>

                        <div className="flex justify-between items-center">
                            <p className="text-xl font-bold">
                                {formattedPrice}
                            </p>
                            <p className="text-mist-500 text-end">
                                {listing.status}
                            </p>
                        </div>
                        <div className="flex justify-end items-center">
                            <div className="flex justify-end text-mist-500 gap-1">
                                <LuMapPin />
                                <p className="text-xs text-end ">
                                    {listing.municipality},{" "}
                                    {listing.administrativeDivision}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OptionList(): React.JSX.Element {
    return (
        <>
            <li>
                <button className="btn btn-ghost">
                    <LuFlag className="text-lg font-bold" /> <span>Report</span>
                </button>
            </li>
            <li>
                <button className="btn btn-ghost">
                    <LuShare2 className="text-lg font-bold" />
                    <span>Share</span>
                </button>
            </li>
        </>
    );
}
