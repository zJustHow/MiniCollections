import type { NavigationState, PartialState } from "@react-navigation/native";
import type { MainTabParamList } from "./types";

export type MainTabId = keyof MainTabParamList;

export type ActiveRouteInfo = {
  tab: MainTabId | null;
  screen: string | null;
  usesCustomHeader: boolean;
  isRootTabScreen: boolean;
};

const ROOT_TAB_SCREENS = new Set([
  "BrandsList",
  "GroupsList",
  "StatsHome",
  "FeedbackHome",
  "ProfileHome",
]);

const CUSTOM_HEADER_SCREENS = new Set([
  "BrandObjects",
  "BrandObjectDetail",
  "GroupObjects",
  "GroupObjectDetail",
  "AdminSubmissions",
]);

type NavState = NavigationState | PartialState<NavigationState> | undefined;

function getActiveRoute(state: NavState): { name: string; state?: NavState } | null {
  if (!state?.routes?.length) return null;
  const index = state.index ?? state.routes.length - 1;
  const route = state.routes[index];
  if (!route || typeof route.name !== "string") return null;
  if (route.state) {
    return getActiveRoute(route.state as NavState) ?? { name: route.name, state: route.state };
  }
  return { name: route.name, state: route.state };
}

function getActiveTab(state: NavState): MainTabId | null {
  if (!state?.routes?.length) return null;
  const index = state.index ?? state.routes.length - 1;
  const route = state.routes[index];
  if (!route || typeof route.name !== "string") return null;
  return route.name as MainTabId;
}

export function getActiveRouteInfo(state: NavState): ActiveRouteInfo {
  const tab = getActiveTab(state);
  const leaf = getActiveRoute(state);
  const screen = leaf?.name ?? null;
  const usesCustomHeader = screen ? CUSTOM_HEADER_SCREENS.has(screen) : false;
  const isRootTabScreen = screen ? ROOT_TAB_SCREENS.has(screen) : false;

  return {
    tab,
    screen,
    usesCustomHeader,
    isRootTabScreen,
  };
}
