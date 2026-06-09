let profilePagePrefetch;

export function prefetchProfilePage() {
  if (!profilePagePrefetch) {
    profilePagePrefetch = import("../pages/ProfilePage");
  }
  return profilePagePrefetch;
}
