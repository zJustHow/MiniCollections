import {
  formatReleasePrice as coreFormatReleasePrice,
  formatViewCount as coreFormatViewCount,
} from "@minicollections/core";

export function formatViewCount(count, t) {
  return coreFormatViewCount(count, t);
}

export function formatReleasePrice(obj) {
  return coreFormatReleasePrice(obj);
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
