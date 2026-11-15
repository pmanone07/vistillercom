// All tid vises og tolkes som norsk tid, uansett hvor serveren står.
const TZ = "Europe/Oslo";

const dateFmt = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDate(iso: string) {
  return capitalize(dateFmt.format(new Date(iso)));
}

export function formatShortDate(iso: string) {
  return shortDateFmt.format(new Date(iso));
}

export function formatTime(iso: string) {
  return timeFmt.format(new Date(iso)).replace(".", ":");
}

/** «Lørdag 15. juni 2027 kl. 17:00–20:00» */
export function formatEventWhen(startsAt: string, endsAt?: string | null) {
  const start = `${formatDate(startsAt)} kl. ${formatTime(startsAt)}`;
  if (!endsAt) return start;
  if (osloParts(startsAt).date === osloParts(endsAt).date) return `${start}–${formatTime(endsAt)}`;
  return `${start} – ${formatDate(endsAt)} kl. ${formatTime(endsAt)}`;
}

/** «17:00–19:00», «fra 17:00» eller null. */
export function formatTimeRange(startsAt?: string | null, endsAt?: string | null) {
  if (startsAt && endsAt) return `${formatTime(startsAt)}–${formatTime(endsAt)}`;
  if (startsAt) return `fra ${formatTime(startsAt)}`;
  if (endsAt) return `til ${formatTime(endsAt)}`;
  return null;
}

function osloParts(iso: string | Date) {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, raw: p };
}

/** ISO-tidspunkt -> verdi for <input type="datetime-local"> i norsk tid. */
export function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const { date, time } = osloParts(iso);
  return `${date}T${time}`;
}

/** ISO-tidspunkt -> «YYYY-MM-DD» i norsk tid. */
export function toLocalDate(iso: string) {
  return osloParts(iso).date;
}

/** ISO-tidspunkt -> «HH:MM» i norsk tid (for <input type="time">). */
export function toLocalTime(iso?: string | null) {
  return iso ? osloParts(iso).time : "";
}

function osloOffsetMs(at: Date) {
  const p = osloParts(at).raw;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** «YYYY-MM-DDTHH:MM» tolket som norsk tid -> ISO (UTC). Null ved ugyldig verdi. */
export function fromLocalInput(local?: string | null) {
  if (!local || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(local)) return null;
  const naive = new Date(`${local.slice(0, 16)}:00Z`);
  if (Number.isNaN(naive.getTime())) return null;
  let result = new Date(naive.getTime() - osloOffsetMs(naive));
  // Rundt overgang sommer-/vintertid kan første gjetning bomme med en time.
  const offset = osloOffsetMs(result);
  if (naive.getTime() - offset !== result.getTime()) result = new Date(naive.getTime() - offset);
  return result.toISOString();
}

export function isPast(iso: string) {
  return new Date(iso).getTime() < Date.now();
}
