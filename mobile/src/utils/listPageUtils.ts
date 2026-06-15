import { spacing } from "@minicollections/theme";

/** Matches web main-content inset + 16px grid gap (8px list pad + 8px card margin). */
export const listBrowseContentStyle = {
  paddingHorizontal: spacing.sm,
};

/** Cancels list horizontal padding so header/search keep their own 16px inset. */
export const listBrowseHeaderStyle = {
  marginHorizontal: -spacing.sm,
};

export function withAddCardSlot<T extends { id: number | string }>(
  items: T[],
  showAddCard: boolean,
): T[] {
  return showAddCard ? [{ id: "__add__" } as T, ...items] : items;
}

export function isAddCardItem(item: { id?: number | string | null }) {
  return item.id === "__add__";
}

export const SEARCH_SECTION_DIVIDER_ID = "__search_section_divider__";

export type SearchSectionDividerItem = {
  id: typeof SEARCH_SECTION_DIVIDER_ID;
  __rowKind: "divider";
};

export function isSearchSectionDivider(
  item: { id?: number | string | null; __rowKind?: string },
): item is SearchSectionDividerItem {
  return item.id === SEARCH_SECTION_DIVIDER_ID || item.__rowKind === "divider";
}

/** Inserts a full-width divider before the first object when both brands and objects exist. */
export function withBrandObjectSearchDivider<
  T extends { id?: number | string; __rowKind?: string },
>(items: T[], enabled: boolean): Array<T | SearchSectionDividerItem> {
  if (!enabled) return items;

  const firstObjectIndex = items.findIndex((item) => item.__rowKind === "object");
  if (firstObjectIndex <= 0) return items;

  const hasBrand = items
    .slice(0, firstObjectIndex)
    .some((item) => item.__rowKind === "brand");
  const hasObject = items.some((item) => item.__rowKind === "object");
  if (!hasBrand || !hasObject) return items;

  const divider: SearchSectionDividerItem = {
    id: SEARCH_SECTION_DIVIDER_ID,
    __rowKind: "divider",
  };

  return [
    ...items.slice(0, firstObjectIndex),
    divider,
    ...items.slice(firstObjectIndex),
  ];
}
