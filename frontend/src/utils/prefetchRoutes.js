let profilePagePrefetch;
let registerPagePrefetch;
let forgotPasswordPagePrefetch;
let loginPagePrefetch;
let brandObjectsPagePrefetch;
let groupObjectsPagePrefetch;
let groupObjectDetailPagePrefetch;

export function prefetchProfilePage() {
  if (!profilePagePrefetch) {
    profilePagePrefetch = import("../pages/ProfilePage");
  }
  return profilePagePrefetch;
}

export function prefetchRegisterPage() {
  if (!registerPagePrefetch) {
    registerPagePrefetch = import("../pages/RegisterPage");
  }
  return registerPagePrefetch;
}

export function prefetchForgotPasswordPage() {
  if (!forgotPasswordPagePrefetch) {
    forgotPasswordPagePrefetch = import("../pages/ForgotPasswordPage");
  }
  return forgotPasswordPagePrefetch;
}

export function prefetchLoginPage() {
  if (!loginPagePrefetch) {
    loginPagePrefetch = import("../pages/LoginPage");
  }
  return loginPagePrefetch;
}

export function prefetchAuthPages() {
  prefetchRegisterPage();
  prefetchForgotPasswordPage();
}

export function prefetchBrandObjectsPage() {
  if (!brandObjectsPagePrefetch) {
    brandObjectsPagePrefetch = import("../pages/BrandObjectsPage");
  }
  return brandObjectsPagePrefetch;
}

export function prefetchGroupObjectsPage() {
  if (!groupObjectsPagePrefetch) {
    groupObjectsPagePrefetch = import("../pages/GroupObjectsPage");
  }
  return groupObjectsPagePrefetch;
}

export function prefetchGroupObjectDetailPage() {
  if (!groupObjectDetailPagePrefetch) {
    groupObjectDetailPagePrefetch = import("../pages/GroupObjectDetailPage");
  }
  return groupObjectDetailPagePrefetch;
}
