import AppShell from "@/components/client/appshell";
import MiniDrawer from "@/components/client/appshell";

export default function MeLayout({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return <AppShell children={children} />;
}
