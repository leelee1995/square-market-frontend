"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function changeInterfaceLanguage(newLang: string) {
    const cookieStore = await cookies();
    cookieStore.set("NEXT_LOCALE", newLang, { path: "/", maxAge: 31536000 });

    // Re-evaluates all server text fields on the current screen instantly
    revalidatePath("/", "layout");
}

export async function changeInterfaceCountry(newCountry: string) {
    const cookieStore = await cookies();
    const lowerCountry = newCountry.toLowerCase();

    // Save the memory preference cookie so proxy.ts respects it on future root visits
    cookieStore.set("USER_COUNTRY", lowerCountry, {
        path: "/",
        maxAge: 31536000,
    });

    // Clear server cache grids for all pages under this layout tree
    revalidatePath("/", "layout");

    // Hard redirect the user's browser to the new subdirectory path segment
    redirect(`/${lowerCountry}`);
}
