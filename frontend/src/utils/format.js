export function formatViewCount(count, t) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 1_000_000) {
    const value = (n / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return t("viewsCountMillion", { count: value });
  }
  if (n >= 1_000) {
    const value = (n / 1_000).toFixed(1).replace(/\.0$/, "");
    return t("viewsCountThousand", { count: value });
  }
  return t("viewsCount", { count: n });
}

export const purchasePriceFromFormValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return { purchase_price: null };
  }
  const n = typeof value === "string" ? parseFloat(value, 10) : value;
  if (Number.isNaN(n)) {
    return { purchase_price: null };
  }
  return { purchase_price: n };
};

export const displayPurchasePriceFromObject = (obj) => {
  if (!obj) return undefined;
  return obj.purchase_price ?? obj.purchasePrice;
};

export const formatReleasePrice = (obj) => {
  const cny = obj?.releasePriceCny ?? obj?.release_price_cny;
  const usd = obj?.releasePriceUsd ?? obj?.release_price_usd;
  const parts = [];
  if (cny != null) parts.push(`¥${cny}`);
  if (usd != null) parts.push(`$${usd}`);
  return parts.length > 0 ? parts.join(" / ") : null;
};
