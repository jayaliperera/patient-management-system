export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatWhen(value) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
