import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SetupNotice } from "@/components/setup-notice";
import { requireUser } from "@/lib/auth";
import { getOrgMembers, getOrganizations } from "@/lib/data";
import { getT } from "@/lib/i18n-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getDeletionPlan } from "@/lib/account";
import { CONTACT_EMAIL } from "@/lib/legal";
import { AccountSettings, LanguageSettings } from "./delete-account";
import { OrganizationSettings } from "./organization-settings";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).settings.title };
}

export default async function SettingsPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const t = (await getT()).settings;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
        <Loader />
      </Suspense>
    </div>
  );
}

async function Loader() {
  const user = await requireUser();
  const [organizations, plan] = await Promise.all([getOrganizations(), getDeletionPlan(user.id)]);
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
      <LanguageSettings />
      <AccountSettings email={user.email ?? ""} plan={plan} contactEmail={CONTACT_EMAIL} />
    </div>
  );
}
