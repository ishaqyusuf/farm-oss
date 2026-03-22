/** Convert Naira amount to kobo (minor currency units). */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

/** Convert kobo to Naira display string. */
export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}
