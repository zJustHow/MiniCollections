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
