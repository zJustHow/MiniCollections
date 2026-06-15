import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type HeaderContextValue = {
  headerSlot: ReactNode;
  setHeaderSlot: (slot: ReactNode) => void;
};

const HeaderContext = createContext<HeaderContextValue>({
  headerSlot: null,
  setHeaderSlot: () => {},
});

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerSlot, setHeaderSlotState] = useState<ReactNode>(null);
  const setHeaderSlot = useCallback((slot: ReactNode) => {
    setHeaderSlotState(slot);
  }, []);
  const value = useMemo(
    () => ({ headerSlot, setHeaderSlot }),
    [headerSlot, setHeaderSlot],
  );

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  );
}

export function useHeader() {
  return useContext(HeaderContext);
}
