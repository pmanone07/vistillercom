import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, Toc } from "@/components/legal-page";
import { CONTACT_EMAIL, CONTROLLER_NAME, PRIVACY_UPDATED_EN, privacyMailtoEn } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal data ViStiller processes, why, who helps us, and what rights you have.",
  alternates: { canonical: "/en/privacy", languages: { nb: "/personvern", en: "/en/privacy" } },
};

// Engelsk oversettelse av app/personvern/page.tsx. Endres den norske, må denne endres likt.

const toc = [
  ["controller", "Who is responsible"],
  ["summary", "In short"],
  ["data", "What data we process"],
  ["purpose", "Purpose and legal basis"],
  ["sharing", "Who can see the data"],
  ["processors", "Suppliers (data processors)"],
  ["storage", "Storage, security and retention"],
  ["cookies", "Cookies and local storage"],
  ["app", "The Android and iOS apps"],
  ["children", "Children and young people"],
  ["rights", "Your rights"],
  ["deletion", "Deleting data"],
  ["changes", "Changes"],
  ["contact", "Contact"],
] as const;

function Mail() {
  return <a href={privacyMailtoEn}>{CONTACT_EMAIL}</a>;
}

export default function PrivacyPageEn() {
  return (
    <LegalPage
      lang="en"
      page="privacy"
      title="Privacy policy"
      updated={PRIVACY_UPDATED_EN}
      intro={
        <p>
          ViStiller helps schools, parent associations, sports clubs, bands and other volunteers organize volunteer work
          and events. Here we explain what personal data the service processes, why, and what you can do about it. This
          policy covers the website vistiller.com and the ViStiller apps for Android and iOS. The Norwegian version is
          the original; if the two differ, the{" "}
          <Link href="/personvern" hrefLang="nb">
            Norwegian version
          </Link>{" "}
          applies.
        </p>
      }
    >
      <Toc items={toc} label="Contents" />

      <Section id="controller" title="1. Who is responsible">
        <p>
          The data controller for ViStiller is{" "}
          {CONTROLLER_NAME ? <strong>{CONTROLLER_NAME}</strong> : "the person who runs ViStiller"}. ViStiller is
          currently run by a private individual, not a company. You can reach us at <Mail />.
        </p>
        <p>
          When an organizer (for example a parent association or a sports club) uses ViStiller to collect sign-ups, the
          organizer decides what the event is about and who is invited. For the participant lists, the organizer is
          therefore the data controller, and ViStiller processes the data on the organizer&apos;s behalf. See{" "}
          <a href="#sharing">section 5</a>.
        </p>
      </Section>

      <Section id="summary" title="2. In short">
        <ul>
          <li>We only collect what is needed to organize volunteer work and events.</li>
          <li>Participants don&apos;t need an account. A name is enough, and email is optional.</li>
          <li>We don&apos;t use advertising or tracking, and we never sell data.</li>
          <li>We count visits anonymously, without cookies, to see which pages are used.</li>
          <li>We only use cookies that are needed to keep you logged in and remember the language you chose.</li>
          <li>You can delete your account yourself in the app at any time.</li>
        </ul>
      </Section>

      <Section id="data" title="3. What data we process">
        <h3>Organizers (you, with an account)</h3>
        <ul>
          <li>
            <strong>Account:</strong> email address and password. The password is only stored as a cryptographic hash,
            and nobody at ViStiller can see it.
          </li>
          <li>
            <strong>Login:</strong> when the account was created and when you last logged in. The login service also
            stores technical data such as IP address and browser type in security logs.
          </li>
          <li>
            <strong>Organization:</strong> the name and any description of the school, club or band, and who the
            admins are (email address and role).
          </li>
          <li>
            <strong>Events and tasks:</strong> what you enter, such as title, description, location, time, deadline,
            number of spots and language, and who created the event.
          </li>
          <li>
            <strong>Membership and payment:</strong> we store a customer ID and subscription ID from the payment
            provider Stripe, the status of the subscription and how long it lasts. You enter your card number and
            other payment details directly with Stripe. We never receive them.
          </li>
        </ul>

        <h3>Participants (you, signing up via a link)</h3>
        <ul>
          <li>
            <strong>Name</strong> (required) and <strong>email address</strong> (optional).
          </li>
          <li>Which task you signed up for, and when you signed up or withdrew.</li>
          <li>
            A personal access code, so you can see and change your sign-ups. We only store a hash of the code. The code
            itself only exists in your link and on your device.
          </li>
          <li>The organizer can also add you manually with a name and, optionally, an email address.</li>
        </ul>

        <h3>All visitors</h3>
        <ul>
          <li>
            When you open the website or the app, the servers record technical data such as IP address, time, the
            address that was opened and browser type. This is used for operations, troubleshooting and security.
          </li>
          <li>
            <strong>Visitor statistics:</strong> we use Vercel Web Analytics to count page views. It records which page
            was opened, which page you came from, country, browser, operating system and device type. It uses no
            cookies and doesn&apos;t store your IP address. The statistics only show totals for all visitors, and we
            can&apos;t see who visited. The personal code in sign-up links is removed before anything is sent.
          </li>
        </ul>
        <p>
          We don&apos;t ask for national ID numbers, home addresses, phone numbers, location or other sensitive data.
          Please don&apos;t write such information in free-text fields either.
        </p>
      </Section>

      <Section id="purpose" title="4. Purpose and legal basis">
        <ul>
          <li>
            <strong>Providing the service to organizers</strong> (account, organization, events and membership). The
            legal basis is our agreement with you, cf. the General Data Protection Regulation (GDPR) Article 6(1)(b).
          </li>
          <li>
            <strong>Receiving sign-ups</strong> on behalf of the organizer. The organizer decides the legal basis.
            Normally it is the organizer&apos;s legitimate interest in organizing the work (Article 6(1)(f)), and that
            you ask to be signed up yourself.
          </li>
          <li>
            <strong>Payment and accounting.</strong> The legal basis is the agreement (point b) and the obligation to
            keep accounting records under the Norwegian Bookkeeping Act (point c).
          </li>
          <li>
            <strong>Operations, security and misuse.</strong> We use logs and technical data to keep the service stable
            and secure, and anonymous visitor statistics to improve it. The legal basis is our legitimate interest
            (point f).
          </li>
        </ul>
        <p>
          We don&apos;t use the data for marketing, profiling, advertising or automated decision-making, and we
          don&apos;t sell it.
        </p>
      </Section>

      <Section id="sharing" title="5. Who can see the data">
        <ul>
          <li>
            <strong>Anyone with the sign-up link</strong> can see the event, the organization&apos;s name and the{" "}
            <strong>names</strong> of the people who have signed up for each task. That way everyone can see what is
            missing. The link is not searchable, but anyone who receives it can open it.
          </li>
          <li>
            <strong>The organizer&apos;s admins</strong> can see the whole participant list, including email addresses,
            and the email addresses of the other admins in the organization.
          </li>
          <li>
            <strong>You as a participant</strong> can see your own sign-ups via your personal link.
          </li>
          <li>
            <strong>Our suppliers</strong> process data on our behalf, see the next section.
          </li>
        </ul>
        <p>We don&apos;t disclose data to anyone else unless the law requires us to.</p>
      </Section>

      <Section id="processors" title="6. Suppliers (data processors)">
        <p>We use these suppliers to run ViStiller:</p>
        <ul>
          <li>
            <strong>Supabase</strong> (Supabase Inc.) runs the database and the login, and sends emails about the
            account, for example to confirm your email address. The database is located in a data centre in the EU.
          </li>
          <li>
            <strong>Vercel</strong> (Vercel Inc., USA) hosts the website and the servers the app connects to, and
            produces the visitor statistics. Requests
            may be processed in Vercel&apos;s network outside the EU/EEA.
          </li>
          <li>
            <strong>Stripe</strong> (Stripe Payments Europe Ltd., Ireland) receives payment for memberships. Stripe is
            itself the data controller for some of the data, for example to prevent fraud and meet accounting
            obligations. See{" "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
              Stripe&apos;s privacy policy
            </a>
            .
          </li>
        </ul>
        <p>
          When data is processed outside the EU/EEA, it is done with a lawful transfer basis: the European
          Commission&apos;s standard contractual clauses (SCC), and the EU–US Data Privacy Framework where the supplier
          is certified.
        </p>
        <p>The fonts on the site are hosted by us, so your browser doesn&apos;t fetch anything from Google or others.</p>
      </Section>

      <Section id="storage" title="7. Storage, security and retention">
        <h3>Security</h3>
        <ul>
          <li>All traffic is encrypted (HTTPS).</li>
          <li>
            The database has access rules on every row. An organizer can only see their own organizations, and a
            participant can only see what the link gives access to.
          </li>
          <li>Passwords and personal access codes are only stored as hashes.</li>
          <li>Secret keys are kept on the server only and are never sent to the browser or the app.</li>
        </ul>
        <h3>Retention</h3>
        <ul>
          <li>
            <strong>Account:</strong> until you delete it.
          </li>
          <li>
            <strong>Organizations, events and tasks:</strong> until an admin deletes them, or until the account of the
            last admin is deleted. We don&apos;t delete old events automatically. We encourage organizers to delete
            events they no longer need.
          </li>
          <li>
            <strong>Sign-ups:</strong> until the organizer removes the sign-up or deletes the event. If you withdraw
            yourself, your name disappears from the list, but the sign-up remains marked as withdrawn until the event is
            deleted. See <a href="#deletion">section 12</a> if you want it deleted completely.
          </li>
          <li>
            <strong>Payment:</strong> Stripe keeps payment data for as long as the Bookkeeping Act and other laws
            require, normally five years after the end of the financial year.
          </li>
          <li>
            <strong>Logs:</strong> technical logs at Vercel and Supabase are deleted automatically after a short
            period, according to the suppliers&apos; own routines.
          </li>
        </ul>
      </Section>

      <Section id="cookies" title="8. Cookies and local storage">
        <p>ViStiller only uses what is needed for the service to work. That is why we don&apos;t ask for consent.</p>
        <ul>
          <li>
            <strong>Login cookies</strong> (names starting with <code>sb-</code>) are set when you log in as an
            organizer. They keep you logged in and are deleted when you log out.
          </li>
          <li>
            <strong>Language choice</strong> (<code>vistiller-lang</code>) is set when you choose Norwegian or English.
            It only remembers the language, contains no personal data and is deleted automatically after one year.
          </li>
          <li>
            <strong>Local storage on the device</strong> (localStorage): when you sign up as a participant, your
            personal access code and the name and email you entered are stored, so the next sign-up is quicker. The data
            stays on your device and is only sent to us when you sign up. You can remove it by clearing site data for
            vistiller.com in your browser.
          </li>
          <li>
            <strong>Offline page:</strong> a &quot;service worker&quot; stores a simple page that is shown when you
            have no connection. It contains no personal data.
          </li>
        </ul>
        <p>
          We don&apos;t use any cookies for analytics, advertising or tracking. When you pay, you are sent to
          Stripe&apos;s own payment page, where Stripe&apos;s cookies and terms apply.
        </p>
      </Section>

      <Section id="app" title="9. The Android and iOS apps">
        <p>
          The apps show vistiller.com in their own window, and the same processing applies there as on the website.
          The apps only ask for internet access. They don&apos;t use location, camera, contacts, photos or
          notifications, and they contain no tracking or advertising tools.
        </p>
        <p>
          When you download the app, Google (Google Play) and Apple (App Store) process data under their own terms.
        </p>
      </Section>

      <Section id="children" title="10. Children and young people">
        <p>
          Organizer accounts are intended for adults, for example parents, teachers, coaches and volunteers in
          associations. ViStiller is not designed for children to create accounts.
        </p>
        <p>
          Participants don&apos;t need an account. Some events may still involve children and young people, for example
          pupils or band members. We don&apos;t ask for age and don&apos;t collect more about children than what is
          written in the sign-up. We recommend that parents or guardians sign up children under 13, and that only a
          first name or a nickname is used, since the names are shown to everyone with the link.
        </p>
        <p>
          If a child has entered information you want deleted, contact the organizer or us at <Mail />.
        </p>
      </Section>

      <Section id="rights" title="11. Your rights">
        <p>Under data protection law, you have the right to</p>
        <ul>
          <li>know what data we hold about you, and get a copy (access),</li>
          <li>have errors corrected (rectification),</li>
          <li>have the data deleted (erasure),</li>
          <li>have the processing restricted (restriction),</li>
          <li>receive data you have given us in a machine-readable format (data portability),</li>
          <li>object to processing we carry out on the basis of legitimate interest (objection).</li>
        </ul>
        <p>
          Send an email to <Mail />, and we will reply within one month. We may ask you to confirm that it is you, for
          example by replying from the email address on the account. If it concerns a sign-up, you can also contact the
          organizer directly.
        </p>
        <p>
          If you believe we process data in breach of the rules, you can complain to the Norwegian Data Protection
          Authority,{" "}
          <a href="https://www.datatilsynet.no/en/" target="_blank" rel="noopener noreferrer">
            Datatilsynet
          </a>
          . We would appreciate it if you contact us first.
        </p>
      </Section>

      <Section id="deletion" title="12. Deleting data">
        <ul>
          <li>
            <strong>Organizers</strong> can delete the account themselves under{" "}
            <strong>Settings → Account → Delete my account</strong>. The account is deleted immediately. Organizations
            where you are the only admin are deleted too, with all events, tasks and sign-ups, and an active membership
            is stopped. If the organization has other admins, it is kept, and you are only removed.
          </li>
          <li>
            <strong>Organizers</strong> can delete individual sign-ups, tasks and whole events at any time.
          </li>
          <li>
            <strong>Participants</strong> can withdraw via their personal link. If you want the sign-up deleted
            completely, you can ask the organizer to remove it or write to us.
          </li>
        </ul>
        <p>
          See <Link href="/en/delete-account">delete account</Link> for a step-by-step explanation. It also explains
          what to do if you can&apos;t get into your account.
        </p>
      </Section>

      <Section id="changes" title="13. Changes">
        <p>We update this policy when the service changes. The date at the top shows when it was last changed.</p>
      </Section>

      <Section id="contact" title="14. Contact">
        <p>
          Questions about privacy, or want access to or deletion of your data? Write to <Mail />.
        </p>
      </Section>
    </LegalPage>
  );
}
