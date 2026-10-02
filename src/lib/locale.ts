// src/app/actions/locale.ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateServerLocaleAction(
    country: string,
    language: string,
): Promise<void> {
    const cookieStore = await cookies();

    // Save values in cookies so the server can access them on future requests
    cookieStore.set("NEXT_LOCALE_COUNTRY", country, {
        path: "/",
        httpOnly: true,
    });
    cookieStore.set("NEXT_LOCALE_LANG", language, {
        path: "/",
        httpOnly: true,
    });

    // Tell Next.js to instantly wipe the cached server layout cache and refresh server components
    revalidatePath("/", "layout");
}
