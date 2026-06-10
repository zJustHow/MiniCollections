import { fetchAddCardPageData, getUiPageDataRange } from "./addCardPagination";

export function getNextBrowseUiPage(itemsLoaded, pageSize, reservedFirstPageSlots = 0) {
  if (itemsLoaded === 0) {
    return 0;
  }
  if (reservedFirstPageSlots <= 0) {
    return Math.ceil(itemsLoaded / pageSize);
  }
  const firstLimit = pageSize - reservedFirstPageSlots;
  if (itemsLoaded <= firstLimit) {
    return 1;
  }
  return 1 + Math.ceil((itemsLoaded - firstLimit) / pageSize);
}

export async function fetchBrowseChunk(
  fetchPage,
  uiPage,
  pageSize,
  reservedFirstPageSlots = 0,
) {
  return fetchAddCardPageData(fetchPage, uiPage, pageSize, reservedFirstPageSlots);
}

export function sortItemsByOrderedIds(items, orderedIds) {
  if (!Array.isArray(items) || !Array.isArray(orderedIds) || orderedIds.length === 0) {
    return items ?? [];
  }
  const byId = new Map(items.map((item) => [item.id, item]));
  return orderedIds.map((id) => byId.get(id)).filter(Boolean);
}

export function getBrowseChunkDataLimit(uiPage, pageSize, reservedFirstPageSlots = 0) {
  return getUiPageDataRange(uiPage, pageSize, reservedFirstPageSlots).dataLimit;
}
