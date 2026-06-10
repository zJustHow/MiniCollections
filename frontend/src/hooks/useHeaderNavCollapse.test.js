import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import useHeaderNavCollapse, {
  getLogoNaturalWidth,
  getTabsNaturalWidth,
  getTabsNaturalWidthForCount,
  shouldCollapseHeaderNav,
  useMainNavWouldCollapse,
} from "./useHeaderNavCollapse";

describe("shouldCollapseHeaderNav", () => {
  test("returns false when expanded layout fits", () => {
    expect(
      shouldCollapseHeaderNav({
        headerWidth: 900,
        logoWidth: 200,
        tabsWidth: 480,
        profileWidth: 36,
        gapCount: 2,
      }),
    ).toBe(false);
  });

  test("returns true when profile would overlap tabs", () => {
    expect(
      shouldCollapseHeaderNav({
        headerWidth: 700,
        logoWidth: 200,
        tabsWidth: 480,
        profileWidth: 36,
        gapCount: 2,
      }),
    ).toBe(true);
  });
});

describe("getTabsNaturalWidth", () => {
  test("sums tab widths and gaps from children count", () => {
    const tabs = document.createElement("div");
    tabs.className = "header-tabs";
    tabs.append(document.createElement("button"), document.createElement("button"));
    document.documentElement.style.setProperty("--header-tab-width", "120");

    expect(getTabsNaturalWidth(tabs)).toBe(246);
  });
});

function CollapseProbe({
  enabled,
  headerWidth = 700,
  collapsedClass = false,
  stretchedLogoWidth = 180,
}) {
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const profileRef = useRef(null);
  const collapsed = useHeaderNavCollapse({
    enabled,
    headerRef,
    tabsRef,
    profileRef,
    showLogo: true,
  });

  return (
    <div
      ref={headerRef}
      className={`ant-layout-header${collapsedClass ? " header-nav-collapsed" : ""}`}
      style={{ width: headerWidth }}
      data-stretched-logo-width={stretchedLogoWidth}
    >
      <span className="header-logo-wrap" />
      <div
        ref={tabsRef}
        className="header-tabs"
        style={collapsedClass ? { display: "none" } : undefined}
      >
        <button type="button" />
        <button type="button" />
        <button type="button" />
        <button type="button" />
      </div>
      <div
        ref={profileRef}
        className="header-right"
        style={collapsedClass ? { display: "none" } : undefined}
      />
      <span data-testid="collapsed">{collapsed ? "yes" : "no"}</span>
    </div>
  );
}

describe("getTabsNaturalWidthForCount", () => {
  test("derives width from tab count when tabs are not mounted", () => {
    document.documentElement.style.setProperty("--header-tab-width", "120");
    expect(getTabsNaturalWidthForCount(4)).toBe(498);
  });
});

function DetailPageProbe({ headerWidth = 700 }) {
  const headerRef = useRef(null);
  const compact = useMainNavWouldCollapse({
    enabled: true,
    headerRef,
    profileRef: null,
    tabCount: 4,
  });

  return (
    <div ref={headerRef} className="ant-layout-header" style={{ width: headerWidth }}>
      <div className="header-slot-wrap">
        <div className="header-slot-bar">
          <span className="header-slot-title">BMW</span>
        </div>
      </div>
      <span data-testid="compact">{compact ? "yes" : "no"}</span>
    </div>
  );
}

describe("useMainNavWouldCollapse", () => {
  beforeEach(() => {
    document.documentElement.style.setProperty("--header-tab-width", "120");

    class ResizeObserverMock {
      observe() {}
      disconnect() {}
    }
    global.ResizeObserver = ResizeObserverMock;

    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get() {
        const width = Number.parseInt(this.style?.width, 10);
        return Number.isFinite(width) ? width : 0;
      },
    });
  });

  test("detects compact toolbar on detail pages without default nav tabs", () => {
    render(<DetailPageProbe headerWidth={700} />);
    expect(screen.getByTestId("compact")).toHaveTextContent("yes");
  });

  test("keeps expanded toolbar width on detail pages when there is room", () => {
    render(<DetailPageProbe headerWidth={900} />);
    expect(screen.getByTestId("compact")).toHaveTextContent("no");
  });
});

describe("useHeaderNavCollapse", () => {
  beforeEach(() => {
    document.documentElement.style.setProperty("--header-tab-width", "120");

    class ResizeObserverMock {
      observe() {}
      disconnect() {}
    }
    global.ResizeObserver = ResizeObserverMock;

    Element.prototype.getBoundingClientRect = vi.fn(function rect() {
      if (this.classList?.contains("header-logo-wrap")) {
        const header = this.closest(".ant-layout-header");
        const stretched = Number.parseInt(
          header?.dataset.stretchedLogoWidth,
          10,
        );
        const width = Number.isFinite(stretched) ? stretched : 180;
        return { width, height: 0, top: 0, left: 0, right: 0, bottom: 0 };
      }
      if (this.classList?.contains("header-right")) {
        return { width: 36, height: 0, top: 0, left: 0, right: 0, bottom: 0 };
      }
      return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 };
    });

    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        const width = Number.parseInt(this.style?.width, 10);
        return Number.isFinite(width) ? width : 0;
      },
    });

    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get() {
        const width = Number.parseInt(this.style?.width, 10);
        return Number.isFinite(width) ? width : 0;
      },
    });

    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get() {
        if (this.classList?.contains("header-logo-wrap")) {
          return 180;
        }
        return 0;
      },
    });
  });

  test("collapses when tabs and profile do not fit in the header", () => {
    render(<CollapseProbe enabled headerWidth={700} />);
    expect(screen.getByTestId("collapsed")).toHaveTextContent("yes");
  });

  test("stays expanded when the header is wide enough", () => {
    render(<CollapseProbe enabled headerWidth={900} />);
    expect(screen.getByTestId("collapsed")).toHaveTextContent("no");
  });

  test("stays expanded when collapse detection is disabled", () => {
    render(<CollapseProbe enabled={false} headerWidth={700} />);
    expect(screen.getByTestId("collapsed")).toHaveTextContent("no");
  });

  test("expands after resize even when collapsed logo is flex-stretched", () => {
    const logo = document.createElement("span");
    logo.className = "header-logo-wrap";
    Object.defineProperty(logo, "scrollWidth", { configurable: true, value: 180 });
    expect(getLogoNaturalWidth(logo)).toBe(180);

    const { rerender } = render(
      <CollapseProbe
        enabled
        headerWidth={700}
        collapsedClass
        stretchedLogoWidth={650}
      />,
    );
    expect(screen.getByTestId("collapsed")).toHaveTextContent("yes");

    rerender(
      <CollapseProbe
        enabled
        headerWidth={900}
        collapsedClass
        stretchedLogoWidth={850}
      />,
    );
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(screen.getByTestId("collapsed")).toHaveTextContent("no");
  });
});
