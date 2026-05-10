const MAD = new Intl.NumberFormat("fr-MA", {
  style:                 "currency",
  currency:              "MAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PLAIN = new Intl.NumberFormat("fr-MA", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number as Moroccan Dirham currency.
 *
 * formatCurrency(8000)    → "8 000,00 MAD"
 * formatCurrency(null)    → "—"
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return MAD.format(Number(value));
}

/**
 * Formats a number with 2 decimal places, no currency symbol.
 *
 * formatAmount(1234.5) → "1 234,50"
 */
export function formatAmount(value) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return PLAIN.format(Number(value));
}

/**
 * Formats a percentage.
 *
 * formatPercent(4.48) → "4,48 %"
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return Number(value).toFixed(decimals).replace(".", ",") + " %";
}
