/**
 * Tri-state image override for upload fields:
 * - undefined: unchanged, show/save the default URL
 * - null: explicitly cleared
 * - string: explicit URL (upload or existing selection)
 */
export function resolveImageFieldDisplay(override, defaultUrl) {
  return override !== undefined ? override : defaultUrl ?? null;
}

export function resolveImageFieldPayload(override, ...fallbacks) {
  if (override !== undefined) {
    return override || null;
  }
  for (const url of fallbacks) {
    if (url) return url;
  }
  return null;
}
