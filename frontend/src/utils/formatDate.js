/**
 * Formats an ISO date string or Date object to DD/MM/YYYY (French format).
 *
 * formatDate("2026-02-01")        → "01/02/2026"
 * formatDate("2026-01-15T10:30")  → "15/01/2026"
 * formatDate(null)                → "—"
 */
export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("fr-FR", {
    day:   "2-digit",
    month: "2-digit",
    year:  "numeric",
  });
}

/**
 * Formats an ISO date range as "01/02/2026 → 07/02/2026".
 */
export function formatDateRange(start, end) {
  return `${formatDate(start)} → ${formatDate(end)}`;
}

/**
 * Formats a time string HH:mm:ss to HH:mm.
 *
 * formatTime("08:45:00") → "08:45"
 * formatTime(null)       → "—"
 */
export function formatTime(value) {
  if (!value) return "—";
  return String(value).slice(0, 5);
}

/**
 * Returns "January 2026" style label for a month/year pair.
 *
 * formatMonthYear(1, 2026) → "Janvier 2026"
 */
export function formatMonthYear(month, year) {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
