export function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function monthToDate(month: string) {
  const [y, m] = month.split("-").map((v) => Number(v));
  // first day of month in local time
  return new Date(y, (m ?? 1) - 1, 1);
}

export function addMonths(month: string, delta: number) {
  const d = monthToDate(month);
  d.setMonth(d.getMonth() + delta);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${pad2(m)}`;
}

export function formatMonthTitle(month: string) {
  const d = monthToDate(month);
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(d);
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

