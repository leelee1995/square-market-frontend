import { useRequiredAuth } from "@/hooks/useRequiredAuth";
import { requireUser } from "@/lib/server-helper";
import { redirect } from "next/navigation";

export default async function Settings({
    params,
}: {
    params: Promise<{ country: string }>;
}) {
    await requireUser();

    redirect(`settings/profile`);
}
