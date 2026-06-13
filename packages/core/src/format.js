export function purchasePriceFromFormValue(value) {
  if (value === undefined || value === null || value === "") {
    return { purchase_price: null };
  }
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) {
    return { purchase_price: null };
  }
  return { purchase_price: n };
}

export function normalizePurchaseDateInput(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export function displayPurchasePriceFromObject(obj) {
  if (!obj) return null;
  const raw = obj.purchase_price ?? obj.purchasePrice;
  if (raw == null || raw === "") return null;
  return String(raw);
}
