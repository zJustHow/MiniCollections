import { pickBrandName } from "./displayLocale";

function pickBrandLabel(brand, locale) {
  if (!brand) return null;
  if (typeof brand === "string") return brand;
  return (
    pickBrandName(brand, locale) ??
    brand.name ??
    brand.name_en ??
    brand.name_zh ??
    null
  );
}

export function hydrateBrandObjectFromRouteState(state, locale) {
  if (!state?.brandObject) return null;

  const brandObject = { ...state.brandObject };
  if (!brandObject.brand) {
    const brandLabel =
      pickBrandName(brandObject, locale) ??
      pickBrandLabel(state.brand, locale) ??
      brandObject.brand_name ??
      brandObject.brandName ??
      null;
    if (brandLabel) brandObject.brand = brandLabel;
  }

  return brandObject;
}
