import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Trash2 } from "lucide-react";
import { LegalPage, Section } from "@/components/legal-page";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT_EMAIL, deletionMailtoEn } from "@/lib/legal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Delete account",
  description: "How to delete your ViStiller account and the personal data that belongs to it.",
  alternates: { canonical: "/en/delete-account", languages: { nb: "/slett-konto", en: "/en/delete-account" } },
};

// Engelsk versjon av app/slett-konto/page.tsx. Offentlig side som Google Play og App Store kan lenke til.
export default function DeleteAccountPageEn() {
  return (
    <LegalPage
      lang="en"
      page="deleteAccount"
      title="Delete your ViStiller account"
      intro={
        <p>
          You can delete your ViStiller account at any time, in the app for Android and iOS or on vistiller.com. Your
          personal data is then permanently deleted.
        </p>
      }
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/innstillinger#konto"
          className={cn(buttonVariants({ variant: "destructive" }), "h-12 text-base")}
        >
          <Trash2 /> Delete the account now
        </Link>
        <a href={deletionMailtoEn} className={cn(buttonVariants({ variant: "outline" }), "h-12 text-base")}>
          <Mail /> Request deletion by email
        </a>
      </div>

      <Section id="yourself" title="How to delete the account yourself">
        <ol>
          <li>
            Log in on <Link href="/en/login?next=/dashboard/innstillinger">vistiller.com</Link> or in the ViStiller
            app.
          </li>
          <li>
            Tap <strong>Settings</strong> at the top, and choose <strong>Settings</strong> in the menu.
          </li>
          <li>
            Go down to <strong>Account</strong> and tap <strong>Delete my account</strong>.
          </li>
          <li>
            Type <strong>DELETE</strong> and tap <strong>Delete the account permanently</strong>.
          </li>
        </ol>
        <p>The account is deleted immediately, and you are logged out.</p>
      </Section>

      <Section id="email" title="Can't get into your account?">
        <p>
          Send an email to <a href={deletionMailtoEn}>{CONTACT_EMAIL}</a> from the email address you use in ViStiller,
          and say that you want to delete the account. We will confirm when it is done, within 30 days at the latest. If
          you write from a different address, we must confirm that the account is yours before we delete anything.
        </p>
      </Section>

      <Section id="deleted" title="What is deleted">
        <ul>
          <li>Your account: email address, password and login data.</li>
          <li>Your admin role in all organizations.</li>
          <li>
            Organizations where you are the <strong>only admin</strong>, with all events, tasks and sign-ups. An active
            membership is stopped immediately, with no refund for the rest of the period.
          </li>
        </ul>
      </Section>

      <Section id="kept" title="What is kept">
        <ul>
          <li>
            Organizations that have <strong>other admins</strong>, with their events. You are only removed as an admin.
            If you were the only owner, the admin who has been a member the longest becomes the new owner.
          </li>
          <li>
            Payment data held by the payment provider Stripe, for as long as the Norwegian Bookkeeping Act requires
            (normally five years).
          </li>
          <li>Technical logs, which are deleted automatically after a short time.</li>
        </ul>
      </Section>

      <Section id="participant" title="Signed up without an account?">
        <p>
          Participants have no account that can be deleted. You can withdraw via the personal link you received when you
          signed up. If you want the sign-up and your name deleted completely, you can ask the organizer to remove you,
          or write to <a href={deletionMailtoEn}>{CONTACT_EMAIL}</a> with the name of the event.
        </p>
        <p>
          Read more in the <Link href="/en/privacy">privacy policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
