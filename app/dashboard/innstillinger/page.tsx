import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SetupNotice } from "@/components/setup-notice";
import { requireUser } from "@/lib/auth";
import { getOrgMembers, getOrganizations } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { OrganizationSettings } from "./organization-settings";

export const metadata: Metadata = { title: "Innstillinger" };

export default function SettingsPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Innstillinger</h1>
        <p className="text-sm text-muted-foreground">Navn på organisasjonen og hvem som kan administrere.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
        <Loader />
      </Suspense>
    </div>
  );
}

async function Loader() {
  const user = await requireUser();
  const organizations = await getOrganizations();
  if (organizations.length === 0) redirect("/dashboard");
  const members = await Promise.all(organizations.map((o) => getOrgMembers(o.id)));

  return (
    <div className="space-y-5">
      {organizations.map((organization, index) => (
        <OrganizationSettings
          key={organization.id}
          organization={organization}
          members={members[index]}
          currentUserId={user.id}
        />
      ))}
      <p className="text-sm text-muted-foreground">Innlogget som {user.email}</p>
    </div>
  );
}
