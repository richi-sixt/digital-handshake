/**
 * Translate with fallback: tries t(key), falls back to the English value
 * from the entry/app object when no translation exists.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function te(
  t: (key: any) => string,
  key: string,
  fallback: string,
): string {
  const result = t(key)
  return result === key ? fallback : result
}
