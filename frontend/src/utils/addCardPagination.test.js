import {
  computeTotalPages,
  fetchAddCardPageData,
  getUiPageDataRange,
} from "./addCardPagination";

describe("addCardPagination", () => {
  test("computeTotalPages without reserved slots", () => {
    expect(computeTotalPages(0, 24, 0)).toBe(0);
    expect(computeTotalPages(25, 24, 0)).toBe(2);
  });

  test("computeTotalPages reserves first-page slots", () => {
    expect(computeTotalPages(23, 24, 1)).toBe(1);
    expect(computeTotalPages(24, 24, 1)).toBe(2);
  });

  test("getUiPageDataRange adjusts first page limit", () => {
    expect(getUiPageDataRange(0, 24, 1)).toEqual({ dataOffset: 0, dataLimit: 23 });
    expect(getUiPageDataRange(1, 24, 1)).toEqual({ dataOffset: 23, dataLimit: 24 });
  });

  test("fetchAddCardPageData shrinks first backend page", async () => {
    const fetchPage = vi.fn(async ({ page, size }) => ({
      content: Array.from({ length: size }, (_, i) => `item-${page}-${i}`),
      total_elements: 30,
      total_pages: 2,
    }));

    const response = await fetchAddCardPageData(fetchPage, 0, 24, 1);

    expect(fetchPage).toHaveBeenCalledWith({ page: 0, size: 23 });
    expect(response.content).toHaveLength(23);
    expect(response.total_pages).toBe(2);
  });
});
