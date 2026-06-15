/** Normalize EXPO_PUBLIC_* URL values from env or expo config extra. */
export function normalizePublicUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, "");
}
