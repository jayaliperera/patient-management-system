export const SRI_LANKA_TIME_ZONE = "Asia/Colombo";

export function todayIso() {
  return sriLankaDateParts(new Date()).iso;
}

export function formatWhen(value) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: SRI_LANKA_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: SRI_LANKA_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateOnly(value, options) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: SRI_LANKA_TIME_ZONE,
    ...options,
  }).format(new Date(value));
}

export function appointmentDateIso(value) {
  return sriLankaDateParts(new Date(value)).iso;
}

export function addDaysIso(value, days) {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

export function addMonthsIso(value, months) {
  const date = parseIsoDate(value);
  date.setUTCMonth(date.getUTCMonth() + months);
  return toIsoDate(date);
}

export function pythonWeekday(value) {
  const jsDay = parseIsoDate(value).getUTCDay();
  return (jsDay + 6) % 7;
}

export function isoMonthDays(value) {
  const selected = parseIsoDate(value);
  const year = selected.getUTCFullYear();
  const month = selected.getUTCMonth();
  const first = new Date(Date.UTC(year, month, 1));
  const start = new Date(first);
  start.setUTCDate(first.getUTCDate() - first.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    return {
      iso: toIsoDate(day),
      number: day.getUTCDate(),
      inMonth: day.getUTCMonth() === month,
    };
  });
}

export function isoDateToDisplayDate(value) {
  return parseIsoDate(value);
}

function sriLankaDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SRI_LANKA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { iso: `${byType.year}-${byType.month}-${byType.day}` };
}

function parseIsoDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
