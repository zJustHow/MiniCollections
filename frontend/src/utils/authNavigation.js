const AUTH_ROUTE_LOADERS = {
  "/register": "register",
  "/forgot-password": "forgotPassword",
  "/login": "splash",
};

export function getAuthNavigationLoaderVariant(navigation) {
  if (navigation.state !== "loading") return null;
  return AUTH_ROUTE_LOADERS[navigation.location?.pathname] ?? null;
}
