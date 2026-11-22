import "server-only";
import { createAdminClient, getStripe, isAdminConfigured } from "@/lib/billing";

export interface DeletionPlan {
  /** Organisasjoner der brukeren er eneste administrator – de slettes med alt innhold. */
  deleted: { id: string; name: string }[];
  /** Organisasjoner som har andre administratorer – de beholdes, brukeren fjernes. */
  kept: { id: string; name: string }[];
}

type Admin = ReturnType<typeof createAdminClient>;

/** Hva som skjer med organisasjonene hvis brukeren sletter kontoen. Leses med servernøkkelen. */
async function planFor(admin: Admin, userId: string) {
  const { data: mine, error } = await admin
    .from("organization_members")
    .select("organization_id, role, organizations (id, name)")
    .eq("user_id", userId);
  if (error) throw new Error(`organization_members: ${error.message}`);

  const orgIds = (mine ?? []).map((m) => m.organization_id);
  const { data: others, error: othersError } = orgIds.length
    ? await admin
        .from("organization_members")
        .select("organization_id, user_id, role, created_at")
        .in("organization_id", orgIds)
        .neq("user_id", userId)
        .order("created_at", { ascending: true })
    : { data: [], error: null };
  if (othersError) throw new Error(`organization_members: ${othersError.message}`);

  return (mine ?? []).map((m) => {
    const org = m.organizations as unknown as { id: string; name: string } | null;
    const rest = (others ?? []).filter((o) => o.organization_id === m.organization_id);
    return { id: m.organization_id, name: org?.name ?? "", role: m.role as string, others: rest };
  });
}

export async function getDeletionPlan(userId: string): Promise<DeletionPlan | null> {
  if (!isAdminConfigured) return null;
  const plan = await planFor(createAdminClient(), userId);
  return {
    deleted: plan.filter((o) => o.others.length === 0).map(({ id, name }) => ({ id, name })),
    kept: plan.filter((o) => o.others.length > 0).map(({ id, name }) => ({ id, name })),
  };
}

/**
 * Sletter kontoen til brukeren:
 *  1. Organisasjoner der brukeren er alene slettes – med arrangementer,
 *     oppgaver og påmeldinger (ON DELETE CASCADE). Et eventuelt Stripe-kundeobjekt
 *     slettes også, noe som stopper abonnementet med en gang.
 *  2. I organisasjoner med andre administratorer overtar den eldste
 *     administratoren eierrollen hvis brukeren var eneste eier.
 *  3. Selve brukeren slettes i Supabase Auth. Medlemskap fjernes da
 *     automatisk, og «opprettet av»-felt settes til tomt.
 */
export async function deleteAccount(userId: string) {
  const admin = createAdminClient();
  const plan = await planFor(admin, userId);

  for (const org of plan) {
    if (org.others.length === 0) {
      const { data: row } = await admin.from("organizations").select("*").eq("id", org.id).maybeSingle();
      const customerId = (row as { stripe_customer_id?: string | null } | null)?.stripe_customer_id;
      if (customerId && process.env.STRIPE_SECRET_KEY) {
        try {
          await getStripe().customers.del(customerId);
        } catch (error) {
          // Finnes ikke lenger i Stripe (f.eks. testmodus nullstilt) – da er det ingenting å stoppe.
          const code = (error as { code?: string }).code;
          if (code !== "resource_missing") throw error;
        }
      }
      const { error } = await admin.from("organizations").delete().eq("id", org.id);
      if (error) throw new Error(`organizations.delete: ${error.message}`);
      continue;
    }

    const hasOtherOwner = org.others.some((o) => o.role === "owner");
    if (org.role === "owner" && !hasOtherOwner) {
      const { error } = await admin
        .from("organization_members")
        .update({ role: "owner" })
        .eq("organization_id", org.id)
        .eq("user_id", org.others[0].user_id);
      if (error) throw new Error(`organization_members.update: ${error.message}`);
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(`auth.admin.deleteUser: ${error.message}`);
}
