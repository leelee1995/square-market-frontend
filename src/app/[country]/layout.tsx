import type { Metadata } from "next";
import "../globals.css";
import { cookies } from "next/headers";
import { AuthProvider } from "@/components/auth-provider";
import { ToastContainer } from "@/components/toast-container";

export const metadata: Metadata = {
    title: "Huberce",
    description: "Trade with your neighbors",
};

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const language = cookieStore.get("NEXT_LOCALE")?.value || "en";

    return (
        <html lang={language}>
            <body className="min-h-screen">
                <AuthProvider>
                    {children}
                    <ToastContainer />
                </AuthProvider>
            </body>
        </html>
    );
}
