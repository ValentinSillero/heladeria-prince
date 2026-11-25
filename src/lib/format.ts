/** $23.000 — formato argentino, sin decimales, estable entre servidor y navegador */
export function formatPrice(value: number): string {
  const n = Math.round(value);
  const sign = n < 0 ? "-" : "";
  const digits = Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}$${digits}`;
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
