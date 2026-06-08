import { matchPath } from "react-router-dom";

const CUSTOM_HEADER_PATTERNS = [
  "/profile",
  "/brands/:brandId",
  "/brands/:brandId/objects/:objectId",
  "/groups/:groupId",
  "/groups/:groupId/objects/:objectId",
  "/admin/brands",
  "/admin/brands/:brandId",
];

const STANDALONE_AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/wechat-callback",
]);

export function usesMainLayout(pathname) {
  return !STANDALONE_AUTH_PATHS.has(pathname);
}

export function usesCustomHeader(pathname) {
  return CUSTOM_HEADER_PATTERNS.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname),
  );
}

export function resolveHeaderSkeletonEndActions(
  pathname,
  { isAdmin = false } = {},
) {
  if (matchPath({ path: "/profile", end: true }, pathname)) {
    return 1;
  }
  if (
    matchPath({ path: "/admin/brands", end: true }, pathname) ||
    matchPath({ path: "/admin/brands/:brandId", end: true }, pathname)
  ) {
    return 1;
  }
  if (
    matchPath({ path: "/brands/:brandId", end: true }, pathname) ||
    matchPath(
      { path: "/brands/:brandId/objects/:objectId", end: true },
      pathname,
    )
  ) {
    return isAdmin ? 2 : 0;
  }
  if (
    matchPath({ path: "/groups/:groupId", end: true }, pathname) ||
    matchPath(
      { path: "/groups/:groupId/objects/:objectId", end: true },
      pathname,
    )
  ) {
    return 2;
  }
  return 0;
}

export function resolveRouteSkeletonVariant(pathname) {
  if (matchPath({ path: "/register", end: true }, pathname)) {
    return "register";
  }
  if (matchPath({ path: "/forgot-password", end: true }, pathname)) {
    return "forgotPassword";
  }
  if (matchPath({ path: "/wechat-callback", end: true }, pathname)) {
    return "wechatCallback";
  }
  if (matchPath({ path: "/admin/brands/:brandId", end: true }, pathname)) {
    return "admin";
  }
  if (matchPath({ path: "/admin/brands", end: true }, pathname)) {
    return "admin";
  }
  if (matchPath({ path: "/admin", end: true }, pathname)) {
    return "admin";
  }
  if (matchPath({ path: "/feedback", end: true }, pathname)) {
    return "feedback";
  }
  if (matchPath({ path: "/profile", end: true }, pathname)) {
    return "profile";
  }
  if (
    matchPath({ path: "/groups/:groupId/objects/:objectId", end: true }, pathname)
  ) {
    return "groupObjectDetail";
  }
  if (
    matchPath({ path: "/brands/:brandId/objects/:objectId", end: true }, pathname)
  ) {
    return "brandObjectDetail";
  }
  if (matchPath({ path: "/brands/:brandId", end: true }, pathname)) {
    return "brandObjects";
  }
  if (matchPath({ path: "/groups/:groupId", end: true }, pathname)) {
    return "groupObjects";
  }
  if (matchPath({ path: "/groups", end: true }, pathname)) {
    return "groups";
  }
  return "brands";
}
