import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLayoutEffect } from "react";
import {
  Link,
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { HeaderProvider, useHeader } from "./HeaderContext";

function HeaderProbe() {
  const { headerSlot } = useHeader();
  return (
    <div data-testid="header-state">{headerSlot ? "set" : "null"}</div>
  );
}

function LayoutWithPathnameHeaderClear() {
  const location = useLocation();
  const { setHeaderSlot } = useHeader();

  useLayoutEffect(() => {
    setHeaderSlot(null);
  }, [location.pathname, setHeaderSlot]);

  return (
    <>
      <HeaderProbe />
      <Outlet />
    </>
  );
}

function LayoutWithoutPathnameHeaderClear() {
  return (
    <>
      <HeaderProbe />
      <Outlet />
    </>
  );
}

function BrandObjectsPageStub() {
  const { setHeaderSlot } = useHeader();

  useLayoutEffect(() => {
    setHeaderSlot(<span>Brand header</span>);
    return () => setHeaderSlot(null);
  }, [setHeaderSlot]);

  return (
    <div>
      Brand objects
      <Link to="/brands/1/objects/2">Open object</Link>
    </div>
  );
}

function BrandObjectDetailPageStub() {
  const { setHeaderSlot } = useHeader();

  useLayoutEffect(() => {
    setHeaderSlot(<span>Object header</span>);
    return () => setHeaderSlot(null);
  }, [setHeaderSlot]);

  return (
    <div>
      Brand object detail
      <Link to="/brands/1">Back to brand</Link>
    </div>
  );
}

function renderBrandNavigation({ clearOnPathnameChange }) {
  const Layout = clearOnPathnameChange
    ? LayoutWithPathnameHeaderClear
    : LayoutWithoutPathnameHeaderClear;

  return render(
    <HeaderProvider>
      <MemoryRouter initialEntries={["/brands/1"]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/brands/:brandId" element={<BrandObjectsPageStub />} />
            <Route
              path="/brands/:brandId/objects/:objectId"
              element={<BrandObjectDetailPageStub />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </HeaderProvider>,
  );
}

describe("header slot navigation", () => {
  test("brand page keeps header after returning from object detail", async () => {
    renderBrandNavigation({ clearOnPathnameChange: false });

    expect(screen.getByTestId("header-state")).toHaveTextContent("set");

    await userEvent.click(screen.getByText("Open object"));
    expect(screen.getByText("Brand object detail")).toBeInTheDocument();
    expect(screen.getByTestId("header-state")).toHaveTextContent("set");

    await userEvent.click(screen.getByText("Back to brand"));
    expect(screen.getByText("Brand objects")).toBeInTheDocument();
    expect(screen.getByTestId("header-state")).toHaveTextContent("set");
  });

  test("pathname header clear clears header when brand data is already loaded", () => {
    render(
      <HeaderProvider>
        <MemoryRouter
          initialEntries={[
            "/brands/1",
            "/brands/1/objects/2",
            "/brands/1",
          ]}
          initialIndex={2}
        >
          <Routes>
            <Route element={<LayoutWithPathnameHeaderClear />}>
              <Route
                path="/brands/:brandId"
                element={<BrandObjectsPageStub />}
              />
              <Route
                path="/brands/:brandId/objects/:objectId"
                element={<BrandObjectDetailPageStub />}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </HeaderProvider>,
    );

    expect(screen.getByText("Brand objects")).toBeInTheDocument();
    expect(screen.getByTestId("header-state")).toHaveTextContent("null");
  });
});
