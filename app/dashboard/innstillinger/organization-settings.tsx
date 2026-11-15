"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Field, bigInput } from "@/components/field";
import type { OrgMember } from "@/lib/data";
import type { Organization } from "@/lib/types";
import { addOrgAdmin, removeOrgMember, renameOrganization } from "../actions";

interface Props {
  organization: Organization;
  members: OrgMember[];
  currentUserId: string;
}

export function OrganizationSettings({ organization, members, currentUserId }: Props) {
  const router = useRouter();
  const [name, setName] = useState(organization.name);
  const [email, setEmail] = useState("");
  const [removing, setRemoving] = useState<OrgMember | null>(null);
  const [renamePending, startRename] = useTransition();
  const [addPending, startAdd] = useTransition();

  const isOwner = members.some((m) => m.user_id === currentUserId && m.role === "owner");
  const ownerCount = members.filter((m) => m.role === "owner").length;
  const domId = organization.id.slice(0, 8);

  function rename(e: React.FormEvent) {
    e.preventDefault();
    startRename(async () => {
      const result = await renameOrganization({ organizationId: organization.id, name });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Navnet er lagret");
      router.refresh();
    });
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    startAdd(async () => {
      const result = await addOrgAdmin({ organizationId: organization.id, email });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Administrator lagt til");
      setEmail("");
      router.refresh();
    });
  }

  async function confirmRemove() {
    if (!removing) return;
    const leaving = removing.user_id === currentUserId;
    const result = await removeOrgMember({ organizationId: organization.id, userId: removing.user_id });
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success(leaving ? "Du har forlatt organisasjonen" : "Administratoren er fjernet");
    if (leaving) router.push("/dashboard");
    router.refresh();
  }

  function canRemove(member: OrgMember) {
    if (member.role === "owner" && ownerCount <= 1) return false;
    return isOwner || member.user_id === currentUserId;
  }

  return (
    <section className="space-y-6 rounded-2xl bg-background p-5 ring-1 ring-foreground/10">
      <form onSubmit={rename} className="space-y-3">
        <Field label="Navn på organisasjonen" htmlFor={`org-name-${domId}`} hint="Vises til alle som åpner en påmeldingslenke.">
          <div className="flex gap-2">
            <Input
              id={`org-name-${domId}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              className={bigInput}
            />
            <Button
              type="submit"
              variant="outline"
              disabled={renamePending || !name.trim() || name.trim() === organization.name}
              className="h-11 shrink-0"
            >
              {renamePending && <Loader2 className="animate-spin" />} Lagre
            </Button>
          </div>
        </Field>
      </form>

      <div className="space-y-3">
        <div>
          <h2 className="font-semibold">Administratorer</h2>
          <p className="text-sm text-muted-foreground">Alle her kan opprette og endre arrangementer for {organization.name}.</p>
        </div>
        <ul className="divide-y rounded-xl ring-1 ring-foreground/10">
          {members.map((member) => (
            <li key={member.user_id} className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{member.email}</span>
                <span className="block text-xs text-muted-foreground">
                  {member.role === "owner" ? "Eier" : "Administrator"}
                  {member.user_id === currentUserId && " · deg"}
                </span>
              </span>
              {canRemove(member) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRemoving(member)}
                  aria-label={member.user_id === currentUserId ? "Forlat organisasjonen" : `Fjern ${member.email}`}
                  className="shrink-0 text-muted-foreground"
                >
                  <X />
                </Button>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={add} className="space-y-1.5">
          <Field
            label="Legg til administrator"
            htmlFor={`org-admin-${domId}`}
            hint="Personen må først ha opprettet en ViStiller-konto med denne e-postadressen."
          >
            <div className="flex gap-2">
              <Input
                id={`org-admin-${domId}`}
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="navn@eksempel.no"
                required
                className={bigInput}
              />
              <Button type="submit" disabled={addPending || !email.trim()} className="h-11 shrink-0">
                {addPending ? <Loader2 className="animate-spin" /> : <UserPlus />} Legg til
              </Button>
            </div>
          </Field>
        </form>
      </div>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={removing?.user_id === currentUserId ? "Forlate organisasjonen?" : "Fjerne administratoren?"}
        description={
          removing?.user_id === currentUserId
            ? `Du mister tilgangen til alle arrangementene til ${organization.name}.`
            : `${removing?.email ?? ""} mister tilgangen til arrangementene til ${organization.name}.`
        }
        confirmLabel={removing?.user_id === currentUserId ? "Ja, forlat" : "Ja, fjern"}
        destructive
        onConfirm={confirmRemove}
      />
    </section>
  );
}
