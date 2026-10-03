export async function getListings(
    category?: string | null,
): Promise<Listing[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/listings/all${query}`,
        );

        if (!res.ok) throw new Error("Failed to fetch listings.");

        const page = await res.json();

        return page.content;
    } catch (error) {
        throw new Error("Server request error.");
    }
}
