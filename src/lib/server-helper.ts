import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/* FOR SERVER COMPONENTS */

//  Fetches current user
export async function getUser() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) return null;

    const res = await fetch(`http://localhost:8080/api/auth/me`, {
        headers: {
            Cookie: `access_token=${accessToken}`,
        },
        cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
}

//  Return current user or redirect user
export async function requireUser() {
    const user = await getUser();

    if (!user) redirect("/");

    return user;
}
