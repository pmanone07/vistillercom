import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, Toc } from "@/components/legal-page";
import { CONTACT_EMAIL, CONTROLLER_NAME, TERMS_UPDATED_EN } from "@/lib/legal";
import { MEMBERSHIP, showPricing } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms for using ViStiller – for organizers and participants.",
  alternates: { canonical: "/en/terms", languages: { nb: "/vilkar", en: "/en/terms" } },
};

// Engelsk oversettelse av app/vilkar/page.tsx. Endres den norske, må denne endres likt.

const toc = [
  ["service", "The service and who can use it"],
  ["account", "Account and login"],
  ["events", "Events, volunteer work and tasks"],
  ["membership", "Membership and payment"],
  ["content", "Responsibility for what you enter"],
  ["use", "Acceptable use"],
  ["privacy", "Privacy"],
  ["deletion", "Deleting your account and data"],
  ["operation", "Availability, changes and downtime"],
  ["liability", "Limitation of liability"],
  ["law", "Governing law and disputes"],
  ["contact", "Contact and who is responsible"],
] as const;

const membershipTerms = [
  `NOK ${MEMBERSHIP.priceNok} incl. VAT is charged when you start, and then once a year.`,
  "The price includes VAT. Nothing is added on top.",
  "The subscription renews automatically until you cancel it.",
  "You can cancel at any time under “Membership”. Access lasts until the end of the period you have paid for.",
  "The payment covers one organization (school, club, band or group), however many admins you are.",
  "Secure card payment via Stripe. ViStiller does not store card details.",
];

function Mail() {
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}

export default function TermsPageEn() {
  return (
    <LegalPage
      lang="en"
      page="terms"
      title="Terms of service"
      updated={TERMS_UPDATED_EN}
      intro={
        <p>
          These terms apply to the use of ViStiller on vistiller.com and in the apps for Android and iOS. When you
          create an account or sign up for an event, you accept the terms. The Norwegian version is the original; if the
          two differ, the{" "}
          <Link href="/vilkar" hrefLang="nb">
            Norwegian version
          </Link>{" "}
          applies.
        </p>
      }
    >
      <Toc items={toc} label="Contents" />

      <Section id="service" title="1. The service and who can use it">
        <p>
          ViStiller is a tool for organizing volunteer work and events for schools, parent associations, sports clubs,
          bands and other groups. With ViStiller you can create events with tasks and a set number of spots, share them
          with a link or QR code, and see who has signed up for what.
        </p>
        <p>There are two ways to use ViStiller:</p>
        <ul>
          <li>
            <strong>Organizers</strong> have an account and create and manage events for an organization. Organizer
            accounts are for adults, and you must be at least 18 to create one.
          </li>
          <li>
            <strong>Participants</strong> sign up via a link, without an account and free of charge. If the participant
            is a child, a parent or guardian should sign the child up.
          </li>
        </ul>
      </Section>

      <Section id="account" title="2. Account and login">
        <ul>
          <li>You register with an email address you have access to, and a password of at least 8 characters.</li>
          <li>
            You are responsible for everything that happens with your account. Keep the password secret, and don&apos;t
            share the account with others. If more people need to manage events, add them as admins instead.
          </li>
          <li>If you suspect that someone else has gained access to the account, you must contact us immediately.</li>
          <li>
            Admins in the same organization have equal rights to the events. The owner and the admins are themselves
            responsible for who they give access to.
          </li>
        </ul>
      </Section>

      <Section id="events" title="3. Events, volunteer work and tasks">
        <ul>
          <li>
            Organizers can create events with time, place, description and sign-up deadline, add tasks with a number of
            spots, copy previous events, and close, archive or delete them.
          </li>
          <li>
            Each event gets a share link. <strong>Anyone who has the link</strong> can see the event, the
            organization&apos;s name and the names of the people who have signed up. The link is not searchable, but
            anyone who receives it can open it and share it further.
          </li>
          <li>
            Participants can sign up and withdraw as long as the organizer keeps sign-up open. The organizer can also
            add and remove participants.
          </li>
          <li>
            ViStiller is a tool for organizing volunteer work. The event itself, and any agreements between organizer
            and participants, are the organizer&apos;s responsibility. ViStiller is not a party to them.
          </li>
        </ul>
      </Section>

      <Section id="membership" title="4. Membership and payment">
        {!showPricing ? (
          <p>
            ViStiller is free for organizers during a trial period. If we introduce payment, you will be told in
            advance, and nothing is charged unless you choose to pay. ViStiller is always free for participants.
          </p>
        ) : (
          <>
            <p>
              To create and manage events, the organization must have an active membership. It costs NOK{" "}
              {MEMBERSHIP.priceNok} per year per organization, incl. VAT. ViStiller is always free for participants.
            </p>
            <ul>
              {membershipTerms.map((term) => (
                <li key={term}>{term}</li>
              ))}
              <li>
                Without an active membership, the organization can&apos;t create, edit, copy or manage events. Existing
                events are not deleted because of this.
              </li>
              <li>
                We don&apos;t refund the period you have already paid for, either when you cancel or when you delete the
                account, unless mandatory law gives you the right to it.
              </li>
              <li>
                If we change the price, we will give notice well before the next renewal. You can then cancel before the
                new price applies.
              </li>
            </ul>
          </>
        )}
      </Section>

      <Section id="content" title="5. Responsibility for what you enter">
        <ul>
          <li>
            You are responsible for everything you write in ViStiller, such as the organization&apos;s name, events,
            tasks, descriptions and participants you add.
          </li>
          <li>
            As an organizer, you are responsible for making sure you are allowed to collect and share information about
            the participants. This applies especially when the participants are children. Remember that the names are
            shown to everyone who has the link.
          </li>
          <li>
            Don&apos;t write sensitive information, such as health information, national ID numbers or similar, in
            events or tasks.
          </li>
          <li>
            You keep the rights to what you enter. You only give us permission to store and show the content as needed
            to run the service.
          </li>
        </ul>
      </Section>

      <Section id="use" title="6. Acceptable use">
        <p>You may not use ViStiller to</p>
        <ul>
          <li>post illegal, offensive, threatening or discriminatory content,</li>
          <li>enter information about others without being allowed to,</li>
          <li>send advertising or spam, or create fake sign-ups,</li>
          <li>pretend to be another person or organization,</li>
          <li>
            try to gain access to other people&apos;s accounts or data, bypass security or the paywall, or put
            unnecessary load on the service, for example with automated requests,
          </li>
          <li>copy, sell or resell the service.</li>
        </ul>
        <p>
          If you break the terms, we may remove content, close events or close the account. Where possible, we will let
          you know first.
        </p>
      </Section>

      <Section id="privacy" title="7. Privacy">
        <p>
          How we process personal data, who sees what and what rights you have is described in the{" "}
          <Link href="/en/privacy">privacy policy</Link>. It is part of these terms.
        </p>
      </Section>

      <Section id="deletion" title="8. Deleting your account and data">
        <ul>
          <li>
            You can delete the account yourself at any time under <strong>Settings → Account → Delete my account</strong>
            . Organizations where you are the only admin are then deleted with all events, tasks and sign-ups, and an
            active membership is stopped. Organizations with other admins are kept.
          </li>
          <li>Organizers can delete individual sign-ups, tasks and whole events at any time.</li>
          <li>
            Participants can withdraw via their personal link, and can ask the organizer or us to be deleted
            completely.
          </li>
          <li>Deletion can&apos;t be undone.</li>
        </ul>
        <p>
          Read more on <Link href="/en/delete-account">delete account</Link>.
        </p>
      </Section>

      <Section id="operation" title="9. Availability, changes and downtime">
        <ul>
          <li>
            We do our best to keep ViStiller available and working as it should, but we can&apos;t promise that the
            service is always error-free or available. Maintenance, errors and problems at our suppliers can cause
            interruptions.
          </li>
          <li>
            We may develop, change or remove features. If we remove something significant that you pay for, we will let
            you know in advance.
          </li>
          <li>
            We may change the terms. The date at the top shows when they were last changed. For significant changes, we
            will let you know in advance. If you keep using ViStiller after the changes apply, you accept the new terms.
          </li>
          <li>If the service is shut down, we will notify organizers in good time so you can retrieve what you need.</li>
        </ul>
      </Section>

      <Section id="liability" title="10. Limitation of liability">
        <ul>
          <li>
            ViStiller is provided as is. We are not responsible for how events are carried out, whether participants
            show up, or for content that users enter.
          </li>
          <li>
            We are not liable for indirect losses, such as lost profit, lost data or consequential damage from
            downtime.
          </li>
          <li>Our total liability is limited to what the organization has paid for ViStiller in the last 12 months.</li>
          <li>
            The limitations don&apos;t apply if we have acted with gross negligence or intent, or where mandatory
            Norwegian law says otherwise, for example consumer protection law.
          </li>
        </ul>
      </Section>

      <Section id="law" title="11. Governing law and disputes">
        <p>
          These terms are governed by Norwegian law. If there is a disagreement, we will first try to find a solution
          together. If that doesn&apos;t work, the matter can be brought before the ordinary Norwegian courts. If you are
          a consumer, you can also get help from the Norwegian Consumer Council (Forbrukerrådet).
        </p>
      </Section>

      <Section id="contact" title="12. Contact and who is responsible">
        <p>
          ViStiller is currently run by a private individual, not a company
          {CONTROLLER_NAME ? (
            <>
              : <strong>{CONTROLLER_NAME}</strong>
            </>
          ) : null}
          . Questions about the terms, membership or your account? Write to <Mail />.
        </p>
      </Section>
    </LegalPage>
  );
}
