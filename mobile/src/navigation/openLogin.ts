import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { MainTabParamList } from "./types";

type OpenLoginOptions = {
  /** After sign-in, open this main tab (e.g. user tapped Groups while logged out). */
  returnTab?: keyof MainTabParamList;
};

type LoginNavigationSource = {
  navigate: NavigationProp<ParamListBase>["navigate"];
  getParent?: () => LoginNavigationSource | undefined;
  getState?: () => { routeNames?: string[] } | undefined;
};

/** Walk up the tree to the navigator that owns the Login modal. */
export function getRootNavigation(
  navigation: LoginNavigationSource,
): LoginNavigationSource | undefined {
  let current: LoginNavigationSource | undefined = navigation;
  while (current) {
    const routeNames = current.getState?.()?.routeNames;
    if (routeNames?.includes("Login")) {
      return current;
    }
    current = current.getParent?.();
  }
  return undefined;
}

export function openLogin(
  navigation: LoginNavigationSource | undefined,
  options?: OpenLoginOptions,
) {
  const root = navigation ? getRootNavigation(navigation) : undefined;
  if (!root) return;
  root.navigate("Login", {
    returnTab: options?.returnTab,
  });
}
