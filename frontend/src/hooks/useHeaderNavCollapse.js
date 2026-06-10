import { useLayoutEffect, useRef, useState } from "react";

export const HEADER_NAV_GAP = 24;
export const HEADER_PADDING_X = 64;
const DEFAULT_PROFILE_WIDTH = 36;
const DEFAULT_LOGO_WIDTH = 180;

function isElementHidden(el) {
  if (!el) return true;
  const style = getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden";
}

export function getLogoNaturalWidth(logoEl) {
  if (!logoEl) return 0;
  return logoEl.scrollWidth || logoEl.getBoundingClientRect().width;
}

export function getTabsNaturalWidth(tabsEl) {
  if (!tabsEl) return 0;
  const root = getComputedStyle(document.documentElement);
  const tabWidth =
    parseFloat(root.getPropertyValue("--header-tab-width")) || 120;
  const tabsStyle = getComputedStyle(tabsEl);
  const gap = parseFloat(tabsStyle.columnGap || tabsStyle.gap) || 6;
  const count = tabsEl.children.length;
  if (count <= 0) return 0;
  return count * tabWidth + (count - 1) * gap;
}

export function getTabsNaturalWidthForCount(tabCount) {
  if (!tabCount || tabCount <= 0) return 0;
  const root = getComputedStyle(document.documentElement);
  const tabWidth =
    parseFloat(root.getPropertyValue("--header-tab-width")) || 120;
  return tabCount * tabWidth + (tabCount - 1) * 6;
}

export function shouldCollapseHeaderNav({
  headerWidth,
  logoWidth = 0,
  tabsWidth,
  profileWidth,
  paddingX = HEADER_PADDING_X,
  gap = HEADER_NAV_GAP,
  gapCount,
}) {
  const gaps = gapCount ?? (logoWidth > 0 ? 2 : 1);
  const needed =
    paddingX + logoWidth + tabsWidth + profileWidth + gap * gaps;
  return needed > headerWidth + 1;
}

function measureMainNavWouldCollapse({
  header,
  tabs,
  profile,
  tabCount,
  showLogo,
  profileWidthRef,
  logoWidthRef,
}) {
  if (!header) return false;

  const profileWidth = profile?.getBoundingClientRect().width ?? 0;
  if (profileWidth > 0) {
    profileWidthRef.current = profileWidth;
  }

  const logo = header.querySelector(".header-logo-wrap");
  const tabsHidden = !tabs || isElementHidden(tabs);

  if (showLogo && logo && tabs && !tabsHidden) {
    const measuredLogoWidth = getLogoNaturalWidth(logo);
    if (measuredLogoWidth > 0) {
      logoWidthRef.current = measuredLogoWidth;
    }
  } else if (showLogo && logo) {
    const measuredLogoWidth = getLogoNaturalWidth(logo);
    if (
      measuredLogoWidth > 0 &&
      measuredLogoWidth < header.offsetWidth * 0.6
    ) {
      logoWidthRef.current = measuredLogoWidth;
    }
  }

  const logoWidth = showLogo
    ? logoWidthRef.current ||
      getLogoNaturalWidth(logo) ||
      DEFAULT_LOGO_WIDTH
    : 0;

  const tabsWidth =
    tabs && !tabsHidden
      ? getTabsNaturalWidth(tabs)
      : getTabsNaturalWidthForCount(tabCount);

  return shouldCollapseHeaderNav({
    headerWidth: header.offsetWidth,
    logoWidth,
    tabsWidth,
    profileWidth: profileWidthRef.current,
    gapCount: logoWidth > 0 ? 2 : 1,
  });
}

export function useMainNavWouldCollapse({
  enabled,
  headerRef,
  profileRef,
  tabCount = 4,
  showLogo = true,
}) {
  const [wouldCollapse, setWouldCollapse] = useState(false);
  const profileWidthRef = useRef(DEFAULT_PROFILE_WIDTH);
  const logoWidthRef = useRef(DEFAULT_LOGO_WIDTH);

  useLayoutEffect(() => {
    if (!enabled) {
      setWouldCollapse(false);
      return undefined;
    }

    const sync = () => {
      const header = headerRef.current;
      if (!header) {
        setWouldCollapse(false);
        return;
      }

      setWouldCollapse(
        measureMainNavWouldCollapse({
          header,
          tabs: header.querySelector(".header-tabs"),
          profile: profileRef?.current ?? null,
          tabCount,
          showLogo,
          profileWidthRef,
          logoWidthRef,
        }),
      );
    };

    const header = headerRef.current;
    if (!header) {
      setWouldCollapse(false);
      return undefined;
    }

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(header);

    const logo = header.querySelector(".header-logo-wrap");
    if (logo) observer.observe(logo);

    const tabs = header.querySelector(".header-tabs");
    let mutationObserver;
    if (tabs) {
      observer.observe(tabs);
      mutationObserver = new MutationObserver(sync);
      mutationObserver.observe(tabs, { childList: true });
    }

    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [enabled, headerRef, profileRef, tabCount, showLogo]);

  return wouldCollapse;
}

export default function useHeaderNavCollapse(options) {
  return useMainNavWouldCollapse(options);
}
