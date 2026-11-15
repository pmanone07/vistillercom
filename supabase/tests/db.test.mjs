// Kjører migreringene i en lokal Postgres (pglite) og tester tilgangsregler,
// kapasitet og gjestepåmelding. Kjør med: npm run test:db
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "migrations");

const db = new PGlite();

// Minimal etterligning av Supabase: roller, auth.users og auth.uid().
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated;
`);

for (const file of readdirSync(migrationsDir).sort()) {
  await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
}

const ANNA = "00000000-0000-0000-0000-00000000000a";
const BJORN = "00000000-0000-0000-0000-00000000000b";
await db.exec(`insert into auth.users (id, email) values ('${ANNA}', 'anna@example.com'), ('${BJORN}', 'bjorn@example.com');`);

async function as(role, userId, fn) {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${userId ?? ""}', false);`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
  }
}
const asUser = (userId, fn) => as("authenticated", userId, fn);
const asAnon = (fn) => as("anon", null, fn);

async function expectError(promise, pattern) {
  await assert.rejects(promise, (err) => {
    assert.match(String(err.message), pattern);
    return true;
  });
}

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (err) {
    console.error(`FEIL  ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

let orgId, eventId, slug, kakeId, ryddeId;

await test("arrangør oppretter organisasjon, arrangement og oppgaver", async () => {
  await asUser(ANNA, async () => {
    orgId = (await db.query(`select public.create_organization('Strindheim skole FAU') as id`)).rows[0].id;
    const ev = await db.query(
      `insert into public.events (organization_id, title, starts_at)
       values ($1, 'Sommeravslutning – 5. klasse', now() + interval '10 days')
       returning id, public_slug, created_by`,
      [orgId],
    );
    eventId = ev.rows[0].id;
    slug = ev.rows[0].public_slug;
    assert.match(slug, /^sommeravslutning-5-klasse-[0-9a-f]{6}$/);
    assert.equal(ev.rows[0].created_by, ANNA);
    kakeId = (await db.query(
      `insert into public.tasks (event_id, title, capacity, sort_order) values ($1, 'Bake kake', 2, 0) returning id`,
      [eventId],
    )).rows[0].id;
    ryddeId = (await db.query(
      `insert into public.tasks (event_id, title, capacity, sort_order) values ($1, 'Rydding', 1, 1) returning id`,
      [eventId],
    )).rows[0].id;
  });
});

await test("andre brukere ser ikke organisasjonen eller arrangementet", async () => {
  await asUser(BJORN, async () => {
    assert.equal((await db.query(`select * from public.organizations`)).rows.length, 0);
    assert.equal((await db.query(`select * from public.events`)).rows.length, 0);
    assert.equal((await db.query(`select id from public.tasks`)).rows.length, 0);
    await expectError(
      db.query(`insert into public.tasks (event_id, title, capacity) values ($1, 'Snik', 1)`, [eventId]),
      /row-level security/,
    );
    await expectError(
      db.query(`insert into public.events (organization_id, title, starts_at) values ($1, 'Snik', now())`, [orgId]),
      /row-level security/,
    );
  });
});

await test("anonyme har ingen direkte tilgang til tabellene", async () => {
  await asAnon(async () => {
    for (const table of ["organizations", "organization_members", "events", "tasks", "signups"]) {
      await expectError(db.query(`select * from public.${table}`), /permission denied/);
    }
    await expectError(db.query(`select public.create_organization('x')`), /permission denied/);
    await expectError(db.query(`select public.public_event_json($1)`, [eventId]), /permission denied/);
  });
});

let token;

await test("gjest ser arrangementet og melder seg på", async () => {
  await asAnon(async () => {
    const ev = (await db.query(`select public.get_public_event($1) as e`, [slug])).rows[0].e;
    assert.equal(ev.title, "Sommeravslutning – 5. klasse");
    assert.equal(ev.organization_name, "Strindheim skole FAU");
    assert.equal(ev.signup_open, true);
    assert.equal(ev.tasks.length, 2);
    assert.equal(ev.tasks[0].taken, 0);

    const res = (await db.query(
      `select public.signup_for_task($1, ' Kari Nordmann ', 'Kari@Example.com') as r`,
      [kakeId],
    )).rows[0].r;
    token = res.token;
    assert.equal(token.length, 64);

    const after = (await db.query(`select public.get_public_event($1) as e`, [slug])).rows[0].e;
    assert.equal(after.tasks[0].taken, 1);
    assert.deepEqual(after.tasks[0].names, ["Kari Nordmann"]);
    assert.ok(!JSON.stringify(after).includes("example.com"), "e-post skal aldri vises offentlig");
  });
});

await test("samme gjest kan ikke stå to ganger på samme oppgave", async () => {
  await asAnon(() =>
    expectError(db.query(`select public.signup_for_task($1, 'Kari', null, $2)`, [kakeId, token]), /VS_ALREADY_SIGNED_UP/),
  );
});

await test("kapasiteten kan ikke overskrides", async () => {
  await asAnon(async () => {
    await db.query(`select public.signup_for_task($1, 'Ola')`, [kakeId]);
    await expectError(db.query(`select public.signup_for_task($1, 'Per')`, [kakeId]), /VS_TASK_FULL/);
  });
});

await test("token gjenbrukes på tvers av oppgaver i samme arrangement", async () => {
  await asAnon(async () => {
    const res = (await db.query(`select public.signup_for_task($1, 'Kari Nordmann', null, $2) as r`, [ryddeId, token])).rows[0].r;
    assert.equal(res.token, token);
    const mine = (await db.query(`select public.get_my_signups($1) as m`, [token])).rows[0].m;
    assert.equal(mine.participant_name, "Kari Nordmann");
    assert.deepEqual([...mine.task_ids].sort(), [kakeId, ryddeId].sort());
    assert.equal(mine.event.slug, slug);
  });
});

await test("ukjent token gir ingenting og kan ikke melde av andre", async () => {
  await asAnon(async () => {
    assert.equal((await db.query(`select public.get_my_signups('feil') as m`)).rows[0].m, null);
    await expectError(db.query(`select public.cancel_my_signup('feil', $1)`, [kakeId]), /VS_SIGNUP_NOT_FOUND/);
  });
});

await test("avmelding frigjør plassen", async () => {
  await asAnon(async () => {
    await db.query(`select public.cancel_my_signup($1, $2)`, [token, kakeId]);
    const ev = (await db.query(`select public.get_public_event($1) as e`, [slug])).rows[0].e;
    assert.equal(ev.tasks[0].taken, 1);
    await db.query(`select public.signup_for_task($1, 'Per')`, [kakeId]);
    const mine = (await db.query(`select public.get_my_signups($1) as m`, [token])).rows[0].m;
    assert.deepEqual(mine.task_ids, [ryddeId]);
  });
});

await test("arrangør ser påmeldte med e-post, men aldri token-hash", async () => {
  await asUser(ANNA, async () => {
    const rows = (await db.query(
      `select participant_name, participant_email from public.signups where task_id = $1 and cancelled_at is null order by created_at`,
      [ryddeId],
    )).rows;
    assert.equal(rows.length, 1);
    await expectError(db.query(`select access_token_hash from public.signups`), /permission denied/);
    await expectError(
      db.query(`insert into public.signups (task_id, participant_name, access_token_hash) values ($1, 'x', 'y')`, [kakeId]),
      /permission denied/,
    );
    // Arrangøren kan legge inn folk manuelt, også utover kapasiteten.
    await db.query(`insert into public.signups (task_id, participant_name) values ($1, 'Manuell Person')`, [kakeId]);
  });
});

await test("arrangør kan ikke endre lenken eller flytte arrangementet", async () => {
  await asUser(ANNA, async () => {
    await expectError(db.query(`update public.events set public_slug = 'kapret' where id = $1`, [eventId]), /permission denied/);
    await expectError(db.query(`update public.events set organization_id = gen_random_uuid() where id = $1`, [eventId]), /permission denied/);
  });
});

await test("stengt påmelding og utløpt frist stopper nye påmeldinger", async () => {
  await asUser(ANNA, () => db.query(`update public.events set status = 'closed' where id = $1`, [eventId]));
  await asAnon(() => expectError(db.query(`select public.signup_for_task($1, 'Sen')`, [ryddeId]), /VS_EVENT_CLOSED/));
  await asUser(ANNA, () =>
    db.query(`update public.events set status = 'open', signup_deadline = now() - interval '1 hour' where id = $1`, [eventId]),
  );
  await asAnon(async () => {
    await expectError(db.query(`select public.signup_for_task($1, 'Sen')`, [ryddeId]), /VS_DEADLINE_PASSED/);
    const ev = (await db.query(`select public.get_public_event($1) as e`, [slug])).rows[0].e;
    assert.equal(ev.signup_open, false);
  });
  await asUser(ANNA, () => db.query(`update public.events set signup_deadline = null where id = $1`, [eventId]));
});

await test("kopiering gir nytt arrangement med oppgaver, uten påmeldinger", async () => {
  await asUser(ANNA, async () => {
    const newId = (await db.query(
      `select public.copy_event($1, 'Sommeravslutning 2028', now() + interval '375 days') as id`,
      [eventId],
    )).rows[0].id;
    const tasks = (await db.query(`select id, title from public.tasks where event_id = $1 order by sort_order`, [newId])).rows;
    assert.deepEqual(tasks.map((t) => t.title), ["Bake kake", "Rydding"]);
    const signups = (await db.query(`select id from public.signups where task_id = any($1)`, [tasks.map((t) => t.id)])).rows;
    assert.equal(signups.length, 0);
    const ev = (await db.query(`select public_slug from public.events where id = $1`, [newId])).rows[0];
    assert.match(ev.public_slug, /^sommeravslutning-2028-/);
  });
  await asUser(BJORN, () => expectError(db.query(`select public.copy_event($1, 'x', now())`, [eventId]), /VS_NOT_FOUND/));
});

await test("flere administratorer: legge til, tilgang, fjerne og siste eier", async () => {
  await asUser(BJORN, async () => {
    await expectError(db.query(`select * from public.list_org_members($1)`, [orgId]), /VS_NOT_FOUND/);
    await expectError(db.query(`select public.add_org_admin($1, 'bjorn@example.com')`, [orgId]), /VS_NOT_FOUND/);
  });
  await asAnon(() => expectError(db.query(`select public.add_org_admin($1, 'bjorn@example.com')`, [orgId]), /permission denied/));
  await asUser(ANNA, async () => {
    await expectError(db.query(`select public.add_org_admin($1, 'ukjent@example.com')`, [orgId]), /VS_USER_NOT_FOUND/);
    await db.query(`select public.add_org_admin($1, ' Bjorn@Example.com ')`, [orgId]);
    await expectError(db.query(`select public.add_org_admin($1, 'bjorn@example.com')`, [orgId]), /VS_ALREADY_MEMBER/);
    const members = (await db.query(`select email, role from public.list_org_members($1)`, [orgId])).rows;
    assert.deepEqual(members, [
      { email: "anna@example.com", role: "owner" },
      { email: "bjorn@example.com", role: "admin" },
    ]);
  });
  await asUser(BJORN, async () => {
    // Nå ser og styrer Bjørn arrangementet, men kan ikke fjerne eieren.
    assert.equal((await db.query(`select id from public.events where id = $1`, [eventId])).rows.length, 1);
    await db.query(`update public.tasks set capacity = 3 where id = $1`, [kakeId]);
    await expectError(db.query(`select public.remove_org_member($1, $2)`, [orgId, ANNA]), /VS_OWNER_ONLY/);
  });
  await asUser(ANNA, async () => {
    await expectError(db.query(`select public.remove_org_member($1, $2)`, [orgId, ANNA]), /VS_LAST_OWNER/);
    await db.query(`select public.remove_org_member($1, $2)`, [orgId, BJORN]);
  });
  await asUser(BJORN, async () => {
    assert.equal((await db.query(`select id from public.events`)).rows.length, 0);
  });
});

await test("arkivert arrangement er ikke lenger offentlig", async () => {
  await asUser(ANNA, () => db.query(`update public.events set status = 'archived' where id = $1`, [eventId]));
  await asAnon(async () => {
    assert.equal((await db.query(`select public.get_public_event($1) as e`, [slug])).rows[0].e, null);
    assert.equal((await db.query(`select public.get_my_signups($1) as m`, [token])).rows[0].m, null);
  });
});

console.log(process.exitCode ? "\nNoen tester feilet." : `\nAlle ${passed} databasetester besto.`);
