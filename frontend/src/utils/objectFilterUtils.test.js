import {
  buildFilterLayoutProps,
  hasFacetOptions,
  resolveFilterColumnState,
} from "./objectFilterUtils";

describe("objectFilterUtils", () => {
  test("hasFacetOptions detects any facet bucket", () => {
    expect(hasFacetOptions({ categories: [{ id: 1 }] })).toBe(true);
    expect(hasFacetOptions({ brands: [{ id: 2 }] })).toBe(true);
    expect(hasFacetOptions({ brands: [{ id: 2 }] }, { includeBrands: false })).toBe(false);
    expect(hasFacetOptions(null)).toBe(false);
  });

  test("resolveFilterColumnState shows column while loading", () => {
    const state = resolveFilterColumnState({
      searchActive: true,
      searchKeyword: "bmw",
      searchFacets: null,
      facetsLoading: true,
    });
    expect(state.showObjectFilters).toBe(false);
    expect(state.showFilterColumn).toBe(true);
  });

  test("resolveFilterColumnState shows filters when facets available", () => {
    const state = resolveFilterColumnState({
      searchActive: true,
      searchKeyword: "bmw",
      searchFacets: { categories: [{ id: 1 }], brands: [], scales: [], series: [] },
      facetsLoading: false,
    });
    expect(state.showObjectFilters).toBe(true);
    expect(state.showFilterColumn).toBe(true);
  });

  test("buildFilterLayoutProps wires handlers", () => {
    const onToggleCategory = vi.fn();
    const props = buildFilterLayoutProps({
      showFilterColumn: true,
      searchFacets: { categories: [] },
      facetsLoading: false,
      selectedCategoryIds: [1],
      selectedScaleIds: [64],
      onToggleCategory,
      onToggleScale: vi.fn(),
    });
    expect(props.selectedCategoryIds).toEqual([1]);
    expect(props.onToggleCategory).toBe(onToggleCategory);
  });

  test("resolveFilterColumnState hides filters when search inactive", () => {
    const state = resolveFilterColumnState({
      searchActive: false,
      searchKeyword: "bmw",
      searchFacets: { categories: [{ id: 1 }], brands: [], scales: [], series: [] },
      facetsLoading: false,
    });

    expect(state.showObjectFilters).toBe(false);
    expect(state.showFilterColumn).toBe(false);
  });
});
