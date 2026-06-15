import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, neuBoxShadow, neuControlStyle, neuRaisedUp, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";
import { useAuth } from "../providers/AuthProvider";
import { useHeader } from "../providers/HeaderProvider";
import { useLocale } from "../providers/LocaleProvider";
import { getActiveRouteInfo, type MainTabId } from "../navigation/routeHeader";
import { openLogin } from "../navigation/openLogin";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "../navigation/types";
import SiteLogo from "./SiteLogo";
import HeaderBarButton from "./HeaderBarButton";
import HeaderBarIcon from "./HeaderBarIcon";
import GroovedImage from "./GroovedImage";
import {
  getAppTopBarHeight,
  getTopSafeInset,
  HEADER_BAR_BUTTON_PADDING_X,
  HEADER_BAR_ICON_SIZE,
  HEADER_HEIGHT,
  HEADER_PADDING_X,
  neuHeaderBarStyle,
} from "../theme/headerBarStyle";

type MenuTabId = "brands" | "groups" | "stats" | "feedback" | "admin" | "profile";

const TAB_TO_SCREEN: Record<Exclude<MenuTabId, "admin">, MainTabId> = {
  brands: "BrandsTab",
  groups: "GroupsTab",
  stats: "StatsTab",
  feedback: "FeedbackTab",
  profile: "ProfileTab",
};

function resolveActiveMenuTab(
  tab: MainTabId | null,
  screen: string | null,
): MenuTabId {
  if (screen === "AdminSubmissions") return "admin";
  if (tab === "BrandsTab") return "brands";
  if (tab === "GroupsTab") return "groups";
  if (tab === "StatsTab") return "stats";
  if (tab === "FeedbackTab") return "feedback";
  if (tab === "ProfileTab") return "profile";
  return "brands";
}

export default function AppTopBar() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { authed, profile, isAdmin } = useAuth();
  const { t } = useLocale();
  const { headerSlot } = useHeader();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const routeInfo = useNavigationState((state) => getActiveRouteInfo(state));
  const { tab, screen, usesCustomHeader } = routeInfo;

  const activeMenuTab = useMemo(
    () => resolveActiveMenuTab(tab, screen),
    [tab, screen],
  );

  const isCustomBar = usesCustomHeader || Boolean(headerSlot);
  const showSiteLogo = !isCustomBar;
  const showDefaultHeaderNav = !usesCustomHeader && !headerSlot;

  useEffect(() => {
    setMenuOpen(false);
  }, [tab, screen]);

  useEffect(() => {
    if (!showDefaultHeaderNav) setMenuOpen(false);
  }, [showDefaultHeaderNav]);

  const handleTabChange = useCallback(
    (menuTab: MenuTabId) => {
      setMenuOpen(false);

      if (menuTab === "admin") {
        if (!authed || !isAdmin) return;
        navigation.navigate("ProfileTab", { screen: "AdminSubmissions" });
        return;
      }

      const targetTab = TAB_TO_SCREEN[menuTab as Exclude<MenuTabId, "admin">];
      if (
        !authed &&
        (menuTab === "groups" || menuTab === "stats" || menuTab === "feedback")
      ) {
        openLogin(navigation.getParent(), { returnTab: targetTab });
        return;
      }

      if (menuTab === "brands") {
        navigation.navigate("BrandsTab", { screen: "BrandsList" });
      } else if (menuTab === "groups") {
        navigation.navigate("GroupsTab", { screen: "GroupsList" });
      } else if (menuTab === "stats") {
        navigation.navigate("StatsTab", { screen: "StatsHome" });
      } else if (menuTab === "feedback") {
        navigation.navigate("FeedbackTab", { screen: "FeedbackHome" });
      } else if (menuTab === "profile") {
        navigation.navigate("ProfileTab", { screen: "ProfileHome" });
      }
      return;
    },
    [authed, isAdmin, navigation],
  );

  const handleProfilePress = useCallback(() => {
    setMenuOpen(false);
    if (authed) {
      navigation.navigate("ProfileTab", { screen: "ProfileHome" });
      return;
    }
    openLogin(navigation.getParent());
  }, [authed, navigation]);

  const menuItems = useMemo(() => {
    const items: Array<{ id: MenuTabId; label: string }> = [
      { id: "brands", label: t("brands") },
      { id: "groups", label: t("groups") },
      { id: "stats", label: t("stats") },
      { id: "feedback", label: t("feedback") },
    ];
    if (isAdmin) {
      items.push({ id: "admin", label: t("adminPanel") });
    }
    return items;
  }, [isAdmin, t]);

  const topInset = getTopSafeInset(insets.top);
  const topBarHeight = getAppTopBarHeight(insets.top);
  const menuTop = topBarHeight;

  return (
    <>
      <View style={[styles.root, { height: topBarHeight, paddingTop: topInset }]}>
        {isCustomBar ? (
          <View style={[styles.bar, styles.barCustom]}>
            <View style={styles.slotWrapFull}>{headerSlot}</View>
          </View>
        ) : (
          <View style={styles.bar}>
            {showSiteLogo ? (
              <View style={styles.logoWrap}>
                <SiteLogo />
              </View>
            ) : null}

            {showDefaultHeaderNav ? (
              <HeaderBarButton
                active={menuOpen}
                accessibilityLabel={menuOpen ? "close menu" : "menu"}
                onPress={() => setMenuOpen((open) => !open)}
                style={styles.menuBtn}
              >
                <HeaderBarIcon>
                  <Ionicons
                    name={menuOpen ? "close" : "menu"}
                    size={HEADER_BAR_ICON_SIZE}
                    color={menuOpen ? "#fff" : colors.text}
                  />
                </HeaderBarIcon>
              </HeaderBarButton>
            ) : null}
          </View>
        )}
      </View>

      <Modal
        visible={menuOpen && showDefaultHeaderNav}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          style={styles.overlayBackdrop}
          onPress={() => setMenuOpen(false)}
        >
          <View style={[styles.overlay, { top: menuTop }]}>
            {menuItems.map((item) => {
              const active = item.id === activeMenuTab;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => handleTabChange(item.id)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    neuHeaderBarStyle({ active, pressed: pressed && !active }),
                  ]}
                >
                  <Text
                    style={[
                      styles.menuItemLabel,
                      active ? styles.menuItemLabelActive : null,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.menuDivider} />
            <View style={styles.menuProfile}>
              <Pressable
                accessibilityRole="button"
                onPress={handleProfilePress}
                style={({ pressed }) => [
                  styles.profileMenuBtn,
                  neuControlStyle({ pressed }),
                ]}
              >
                <GroovedImage
                  uri={authed ? profile?.avatar_url : undefined}
                  variant="avatar"
                  style={styles.menuAvatar}
                  placeholderLabel={
                    authed
                      ? (profile?.display_name ?? profile?.email ?? "?")
                          .charAt(0)
                          .toUpperCase()
                      : undefined
                  }
                />
                <Text style={styles.menuProfileLabel}>
                  {authed ? profile?.display_name || t("profile") : t("signIn")}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.bg,
    zIndex: 1,
    boxShadow: neuBoxShadow.raisedSm,
    overflow: "visible",
  },
  bar: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: HEADER_PADDING_X,
    gap: 0,
    backgroundColor: colors.bg,
    overflow: "visible",
  },
  barCustom: {
    paddingHorizontal: 0,
  },
  logoWrap: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  slotWrapFull: {
    flex: 1,
    height: HEADER_HEIGHT,
    minWidth: 0,
    alignSelf: "stretch",
    justifyContent: "center",
    overflow: "visible",
  },
  menuBtn: {
    paddingHorizontal: HEADER_BAR_BUTTON_PADDING_X,
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...neuRaisedUp("sm"),
  },
  menuItem: {
    marginHorizontal: spacing.sm,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  menuItemLabel: {
    ...neuText.bodyLg,
    color: colors.text,
  },
  menuItemLabelActive: {
    color: colors.accent,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  menuProfile: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  profileMenuBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  menuAvatar: {
    width: 36,
    height: 36,
  },
  menuProfileLabel: {
    ...neuText.bodyLg,
    color: colors.text,
  },
});
