import { buildAppLink } from "./appLinks";

export function catalogObjectDeepLink(brandId: string, objectId: string) {
  return buildAppLink(`brands/${brandId}/objects/${objectId}`);
}

export function brandObjectsDeepLink(brandId: string) {
  return buildAppLink(`brands/${brandId}`);
}

export function groupObjectsDeepLink(groupId: string) {
  return buildAppLink(`groups/${groupId}`);
}

export function groupObjectDeepLink(groupId: string, objectId: string) {
  return buildAppLink(`groups/${groupId}/objects/${objectId}`);
}
