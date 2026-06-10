import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import useInfiniteList from "./useInfiniteList";

export default function useOrderableInfiniteBrowse({
  entityKey,
  enabled,
  fetchPage,
  fetchOrder,
  reorder,
  pageSize,
  reservedFirstPageSlots = 0,
  listResetKey = "browse",
}) {
  const resetKey = `${listResetKey}:${entityKey}`;
  const infinite = useInfiniteList(fetchPage, {
    resetKey,
    enabled,
    pageSize,
    reservedFirstPageSlots,
  });
  const { items, reorderLocalItems, refresh } = infinite;

  const [orderedIds, setOrderedIds] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const orderedIdsRef = useRef([]);
  const fetchOrderRef = useRef(fetchOrder);
  const reorderRef = useRef(reorder);
  const prevResetKeyRef = useRef(resetKey);
  fetchOrderRef.current = fetchOrder;
  reorderRef.current = reorder;

  const loadOrder = useCallback(async () => {
    if (!enabled) {
      setOrderedIds((current) => (current.length === 0 ? current : []));
      orderedIdsRef.current = [];
      return;
    }
    try {
      const response = await fetchOrderRef.current();
      const ids = Array.isArray(response?.ids) ? response.ids : [];
      const currentIds = orderedIdsRef.current;
      const unchanged =
        currentIds.length === ids.length &&
        currentIds.every((id, index) => id === ids[index]);
      if (unchanged) {
        return;
      }

      setOrderLoading(true);
      orderedIdsRef.current = ids;
      setOrderedIds(ids);
      reorderLocalItems(ids);
    } catch {
      setOrderedIds((current) => (current.length === 0 ? current : []));
      orderedIdsRef.current = [];
    } finally {
      setOrderLoading(false);
    }
  }, [enabled, reorderLocalItems]);

  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      orderedIdsRef.current = [];
      setOrderedIds([]);
    }
    loadOrder();
  }, [enabled, resetKey, loadOrder]);

  const itemsById = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      map.set(item.id, item);
    }
    return map;
  }, [items]);

  const displayItems = useMemo(() => {
    if (orderedIds.length === 0) {
      return items;
    }
    return orderedIds.map((id) => itemsById.get(id)).filter(Boolean);
  }, [orderedIds, itemsById, items]);

  const sortableIds = useMemo(() => {
    if (orderedIds.length > 0) {
      return orderedIds;
    }
    return items.map((item) => item.id);
  }, [orderedIds, items]);

  useEffect(() => {
    if (orderedIds.length > 0) {
      orderedIdsRef.current = orderedIds;
      return;
    }
    orderedIdsRef.current = items.map((item) => item.id);
  }, [orderedIds, items]);

  const sameId = (left, right) => String(left) === String(right);

  const handleDragEnd = useCallback(
    async (activeId, overId) => {
      if (!overId || sameId(activeId, overId)) return null;

      const currentIds = orderedIdsRef.current;
      const oldIndex = currentIds.findIndex((id) => sameId(id, activeId));
      const newIndex = currentIds.findIndex((id) => sameId(id, overId));
      if (oldIndex < 0 || newIndex < 0) return null;

      const nextIds = arrayMove(currentIds, oldIndex, newIndex);
      const previousIds = currentIds;

      setOrderedIds(nextIds);
      orderedIdsRef.current = nextIds;
      reorderLocalItems(nextIds);
      setReordering(true);

      try {
        await reorderRef.current(nextIds);
        return true;
      } catch {
        setOrderedIds(previousIds);
        orderedIdsRef.current = previousIds;
        reorderLocalItems(previousIds);
        return false;
      } finally {
        setReordering(false);
      }
    },
    [reorderLocalItems],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([loadOrder(), refresh()]);
  }, [loadOrder, refresh]);

  return {
    ...infinite,
    displayItems,
    orderedIds: sortableIds,
    orderLoading,
    reordering,
    sortEnabled: enabled && sortableIds.length > 0,
    handleDragEnd,
    refreshAll,
    loadOrder,
  };
}
