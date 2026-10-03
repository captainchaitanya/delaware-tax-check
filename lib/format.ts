export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShares(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format an exact decimal string from the tax engine, keeping trailing precision. */
export function formatUsdExact(decimalString: string): string {
  const negative = decimalString.startsWith("-");
  const raw = negative ? decimalString.slice(1) : decimalString;
  const [whole, frac] = raw.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = frac ? `${grouped}.${frac}` : grouped;
  return `${negative ? "-" : ""}$${body}`;
}
