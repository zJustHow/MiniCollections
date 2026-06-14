const viewedBrands = new Set<string>();
const viewedModels = new Set<string>();

export function trackBrandViewOnce(
  brandId: string,
  isAdmin: boolean,
  record: (id: string) => void | Promise<void>,
) {
  if (isAdmin || !brandId) return;
  if (viewedBrands.has(brandId)) return;
  viewedBrands.add(brandId);
  void record(brandId);
}

export function trackModelViewOnce(
  objectId: string,
  isAdmin: boolean,
  record: (id: string) => void | Promise<void>,
) {
  if (isAdmin || !objectId) return;
  if (viewedModels.has(objectId)) return;
  viewedModels.add(objectId);
  void record(objectId);
}
