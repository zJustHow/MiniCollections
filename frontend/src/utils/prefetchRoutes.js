let profilePagePrefetch;
let registerPagePrefetch;
let forgotPasswordPagePrefetch;
let loginPagePrefetch;
let brandObjectDetailPagePrefetch;
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

export function prefetchBrandObjectDetailPage() {
  if (!brandObjectDetailPagePrefetch) {
    brandObjectDetailPagePrefetch = import("../pages/BrandObjectDetailPage");
  }
  return brandObjectDetailPagePrefetch;
}

export function prefetchGroupObjectDetailPage() {
  if (!groupObjectDetailPagePrefetch) {
    groupObjectDetailPagePrefetch = import("../pages/GroupObjectDetailPage");
  }
  return groupObjectDetailPagePrefetch;
}
