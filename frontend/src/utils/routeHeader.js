import { matchPath } from "react-router-dom";
import AdminBrandPageHeader from "../components/pageHeaders/AdminBrandPageHeader";
import ProfileRouteHeader from "../components/pageHeaders/ProfileRouteHeader";
import { usesCustomHeader } from "./routeSkeleton";

export function resolveRouteHeader({
  location,
  navigate,
  t,
  isAdmin = false,
  onLogout,
}) {
  const { pathname, state = {} } = location;
  if (!usesCustomHeader(pathname)) return null;

  if (matchPath({ path: "/profile", end: true }, pathname)) {
    return (
      <ProfileRouteHeader
        title={t("profileTitle")}
        onBack={() => navigate(-1)}
        onLogout={onLogout}
        logoutLabel={t("logout")}
        confirmLogoutLabel={t("confirmLogout")}
      />
    );
  }

  if (
    matchPath({ path: "/brands/:brandId", end: true }, pathname) ||
    matchPath(
      { path: "/brands/:brandId/objects/:objectId", end: true },
      pathname,
    ) ||
    matchPath({ path: "/groups/:groupId", end: true }, pathname) ||
    matchPath(
      { path: "/groups/:groupId/objects/:objectId", end: true },
      pathname,
    )
  ) {
    // Entity list/detail pages set their own header once mounted.
    return null;
  }

  if (matchPath({ path: "/admin/brands", end: true }, pathname)) {
    return (
      <AdminBrandPageHeader
        brandName={t("brands")}
        onBack={() => navigate("/admin")}
      />
    );
  }

  if (matchPath({ path: "/admin/brands/:brandId", end: true }, pathname)) {
    const brand = state.brand ?? null;
    const brandName = brand?.name_en ?? brand?.name ?? "…";
    return (
      <AdminBrandPageHeader
        brandName={brandName}
        onBack={() => navigate("/admin/brands")}
      />
    );
  }

  if (matchPath({ path: "/admin/categories", end: true }, pathname)) {
    return (
      <AdminBrandPageHeader
        brandName={t("categories")}
        onBack={() => navigate("/admin")}
      />
    );
  }

  if (matchPath({ path: "/admin/scales", end: true }, pathname)) {
    return (
      <AdminBrandPageHeader
        brandName={t("scales")}
        onBack={() => navigate("/admin")}
      />
    );
  }

  return null;
}
