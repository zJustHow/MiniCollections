export function withAddCardSlot(items, showAddCard) {
  return showAddCard ? [{ id: "__add__" }, ...items] : items;
}

export const NO_RESULTS_STYLE = {
  textAlign: "center",
  color: "var(--neu-text-2)",
  padding: "32px 0",
};
