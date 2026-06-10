import { matchPath } from "react-router-dom";
import BrandObjectsPageHeader from "../components/pageHeaders/BrandObjectsPageHeader";
import GroupObjectsPageHeader from "../components/pageHeaders/GroupObjectsPageHeader";

/** Interim header while brand/group list pages lazy-load after navigation. */
export function resolveRouteHeader({
  location,
  isAdmin = false,
}) {
  const { pathname, state = {} } = location;

  if (matchPath({ path: "/brands/:brandId", end: true }, pathname)) {
    return (
      <BrandObjectsPageHeader
        brand={state.brand ?? null}
        returnSearch={state.returnSearch ?? ""}
        isAdmin={isAdmin}
      />
    );
  }

  if (matchPath({ path: "/groups/:groupId", end: true }, pathname)) {
    return (
      <GroupObjectsPageHeader
        group={state.group ?? null}
        returnSearch={state.returnSearch ?? ""}
      />
    );
  }

  return null;
}
