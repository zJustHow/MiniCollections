import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HeaderProvider, useHeader } from "../HeaderContext";
import { LocaleProvider } from "../LocaleContext";
import BrandObjectsPage from "./BrandObjectsPage";

const sampleBrand = { id: 9, name: "BMW", name_en: "BMW" };

function HeaderSlotProbe() {
  const { headerSlot } = useHeader();
  return <div data-testid="header-slot">{headerSlot}</div>;
}

function renderBrandPage(initialEntry, pageProps = {}) {
  return render(
    <LocaleProvider>
      <HeaderProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <HeaderSlotProbe />
          <Routes>
            <Route
              path="/brands/:brandId"
              element={<BrandObjectsPage authed {...pageProps} />}
            />
          </Routes>
        </MemoryRouter>
      </HeaderProvider>
    </LocaleProvider>,
  );
}

describe("BrandObjectsPage integration", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const path = String(url);
        if (path.includes("/objects/search/facets")) {
          return {
            ok: true,
            json: async () => ({
              total: 1,
              categories: [{ id: 1, name: "Cars", count: 1 }],
              brands: [],
              scales: [],
              series: [],
            }),
          };
        }
        if (path.includes("/objects/search")) {
          return {
            ok: true,
            json: async () => ({
              content: [
                {
                  id: 2,
                  name: "M3",
                  image_url: null,
                  brand_name_en: "BMW",
                },
              ],
              page: 0,
              total_elements: 1,
              total_pages: 1,
              total_exact: true,
            }),
          };
        }
        if (path.includes("/objects?")) {
          return {
            ok: true,
            json: async () => ({
              content: [{ id: 1, name: "Browse model", image_url: null }],
              page: 0,
              total_elements: 1,
              total_pages: 1,
              total_exact: true,
            }),
          };
        }
        if (path.match(/\/brands\/9$/)) {
          return {
            ok: true,
            json: async () => sampleBrand,
          };
        }
        throw new Error(`Unhandled fetch: ${path}`);
      }),
    );
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => "1"),
      setItem: vi.fn(),
    });
  });

  test("search switches to results without crashing", async () => {
    renderBrandPage(
      {
        pathname: "/brands/9",
        state: { brand: sampleBrand, returnSearch: "?q=bmw" },
      },
      { authed: false },
    );

    await waitFor(() =>
      expect(screen.getByText("Browse model")).toBeInTheDocument(),
    );

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "m3" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(
      () => expect(screen.getByText("M3")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  test("admin header includes edit and delete actions once brand is ready", async () => {
    renderBrandPage(
      {
        pathname: "/brands/9",
        state: { brand: sampleBrand, returnSearch: "?page=2" },
      },
      { isAdmin: true, authed: true },
    );

    await waitFor(() =>
      expect(screen.getByText("Browse model")).toBeInTheDocument(),
    );

    await waitFor(() => {
      const endActions = screen
        .getByTestId("header-slot")
        .querySelector(".header-slot-actions-end");
      expect(endActions?.querySelectorAll("button")).toHaveLength(2);
    });
  });
});
