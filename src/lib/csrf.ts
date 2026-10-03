/**
 * The XSRF-TOKEN cookie lives on the backend's domain, so document.cookie
 * on the frontend can't see it. Ask the backend for the token instead
 * (the same request also (re)sets the cookie in the browser).
 */
export async function getCsrfToken(): Promise<string> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/csrf`,
        {
            credentials: "include",
            cache: "no-store",
        },
    );

    if (!res.ok) throw new Error("Failed to fetch CSRF token.");

    const data: { token: string } = await res.json();
    return data.token;
}
