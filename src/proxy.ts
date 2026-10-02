// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_COUNTRIES = ["us", "br"] as const;
const DEFAULT_COUNTRY = "us";

const SUPPORTED_LANGUAGES = ["en", "pt"] as const;
const DEFAULT_LANGUAGE = "en";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Ignore static assets
    if (pathname.includes(".")) {
        return NextResponse.next();
    }

    const response = NextResponse.next();

    // ----------------------------------------------------
    // Validate country segment
    // ----------------------------------------------------

    const pathSegments = pathname.split("/").filter(Boolean);
    const firstSegment = pathSegments[0]?.toLowerCase();

    if (
        firstSegment &&
        !SUPPORTED_COUNTRIES.includes(
            firstSegment as (typeof SUPPORTED_COUNTRIES)[number],
        )
    ) {
        const url = request.nextUrl.clone();

        url.pathname = "/";

        return NextResponse.redirect(url);
    }

    // Keep the cookie matching whatever country is actually in the URL,
    // so it doesn't go stale when someone navigates to a different
    // /[country] path directly (not through the "/" redirect below).
    if (firstSegment) {
        const cookieCountry = request.cookies
            .get("USER_COUNTRY")
            ?.value?.toLowerCase();

        if (cookieCountry !== firstSegment) {
            response.cookies.set("USER_COUNTRY", firstSegment, {
                path: "/",
                maxAge: 60 * 60 * 24 * 365,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });
        }
    }

    // ----------------------------------------------------
    // Language
    // ----------------------------------------------------

    if (!request.cookies.has("NEXT_LOCALE")) {
        const acceptLanguage = request.headers.get("accept-language") ?? "";

        //  pt-BR,pt;q=0.9,en;q=0.8
        const browserLanguage =
            acceptLanguage
                .split(",")
                .map((lang) =>
                    lang.split(";")[0].trim().split("-")[0].toLowerCase(),
                )
                .find((lang) =>
                    SUPPORTED_LANGUAGES.includes(
                        lang as (typeof SUPPORTED_LANGUAGES)[number],
                    ),
                ) ?? DEFAULT_LANGUAGE;

        response.cookies.set("NEXT_LOCALE", browserLanguage, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
    }

    // ----------------------------------------------------
    // Root redirect
    // ----------------------------------------------------

    if (pathname === "/") {
        let country = request.cookies.get("USER_COUNTRY")?.value?.toLowerCase();

        if (
            !country ||
            !SUPPORTED_COUNTRIES.includes(
                country as (typeof SUPPORTED_COUNTRIES)[number],
            )
        ) {
            country =
                request.headers.get("x-vercel-ip-country")?.toLowerCase() ?? "";

            // Fallback to browser locale region
            if (
                !SUPPORTED_COUNTRIES.includes(
                    country as (typeof SUPPORTED_COUNTRIES)[number],
                )
            ) {
                const acceptLanguage =
                    request.headers.get("accept-language") ?? "";

                const region = acceptLanguage
                    .match(/-([a-zA-Z]{2})/)?.[1]
                    ?.toLowerCase();

                if (
                    region &&
                    SUPPORTED_COUNTRIES.includes(
                        region as (typeof SUPPORTED_COUNTRIES)[number],
                    )
                ) {
                    country = region;
                } else {
                    country = DEFAULT_COUNTRY;
                }
            }

            response.cookies.set("USER_COUNTRY", country, {
                path: "/",
                maxAge: 60 * 60 * 24 * 365,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });
        }

        const url = request.nextUrl.clone();
        url.pathname = `/${country}`;

        const redirect = NextResponse.redirect(url);

        // Preserve cookies that were set on `response`
        response.cookies.getAll().forEach((cookie) => {
            redirect.cookies.set(cookie);
        });

        return redirect;
    }

    return response;
}

//  Add exception directories here
export const config = {
    matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
