import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { ReactNode } from "react";
import { useHeader } from "../providers/HeaderProvider";

export function useHeaderSlot(slot: ReactNode, deps: readonly unknown[] = []) {
  const { setHeaderSlot } = useHeader();

  useFocusEffect(
    useCallback(() => {
      setHeaderSlot(slot);
      return () => setHeaderSlot(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setHeaderSlot, ...deps]),
  );
}
