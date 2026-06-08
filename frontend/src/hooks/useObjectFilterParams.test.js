import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router-dom";
import useObjectFilterParams from "./useObjectFilterParams";

function FilterProbe({ includeBrands = true }) {
  const [searchParams] = useSearchParams();
  const hook = useObjectFilterParams({ includeBrands });
  return (
    <div>
      <span data-testid="search">{searchParams.toString()}</span>
      <span data-testid="brand-count">{hook.selectedBrandIds.length}</span>
      <button type="button" onClick={() => hook.onToggleCategory(1)}>
        toggle-category
      </button>
      <button type="button" onClick={() => hook.setSearchQueryClearingFilters("bmw")}>
        set-search
      </button>
    </div>
  );
}

function renderAt(path, props = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<FilterProbe {...props} />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("useObjectFilterParams", () => {
  test("reads selected ids from search params", () => {
    renderAt("/?categoryIds=1&categoryIds=2&brandIds=3&scaleIds=64&seriesIds=9");
    expect(screen.getByTestId("search").textContent).toContain("categoryIds=1");
    expect(screen.getByTestId("search").textContent).toContain("brandIds=3");
  });

  test("toggle category updates URL params", async () => {
    renderAt("/?categoryIds=1");
    await userEvent.click(screen.getByRole("button", { name: "toggle-category" }));
    expect(screen.getByTestId("search").textContent).not.toContain("categoryIds=1");
  });

  test("setSearchQueryClearingFilters clears filters and pages", async () => {
    renderAt("/?q=old&categoryIds=1&page=2&brandPage=1");
    await userEvent.click(screen.getByRole("button", { name: "set-search" }));
    const params = new URLSearchParams(screen.getByTestId("search").textContent);
    expect(params.get("q")).toBe("bmw");
    expect(params.has("categoryIds")).toBe(false);
    expect(params.has("page")).toBe(false);
    expect(params.has("brandPage")).toBe(false);
  });

  test("exclude brand filters when includeBrands is false", () => {
    renderAt("/?brandIds=3", { includeBrands: false });
    expect(screen.getByTestId("search").textContent).toContain("brandIds=3");
    expect(screen.getByTestId("brand-count").textContent).toBe("0");
  });
});
