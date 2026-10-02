import AppShell from "@/components/client/appshell";

export default async function MarketLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppShell children={children} />;
}
