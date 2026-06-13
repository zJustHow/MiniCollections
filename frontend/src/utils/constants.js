/** Bust browser cache when seed media files are replaced at the same MinIO URL. */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.includes("minicollections-media/") && !/[?&]v=/.test(url)) {
    return `${url}${url.includes("?") ? "&" : "?"}v=2`;
  }
  return url;
}

export { COUNTRIES, parsePhone, formatPhoneIdentifier } from "@minicollections/core";
