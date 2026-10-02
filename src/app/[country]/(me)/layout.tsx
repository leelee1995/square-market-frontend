import AppShell from "@/components/client/appshell";
import MiniDrawer from "@/components/client/appshell";
import { Box } from "@mui/material";

export default function MeLayout({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return <AppShell children={children} />;
}
